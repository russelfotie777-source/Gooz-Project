<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\PurchaseInvoice\StorePurchaseInvoiceRequest;
use App\Http\Requests\PurchaseInvoice\UpdatePurchaseInvoiceRequest;
use App\Http\Resources\PurchaseInvoiceResource;
use App\Models\PurchaseInvoice;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderLine;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class PurchaseInvoiceController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->query('per_page', 25), 100) ?: 25;

        $invoices = PurchaseInvoice::query()
            ->with(['purchaseOrder:id,code', 'supplier:id,company_name'])
            ->when($request->query('status'), fn ($q, $status) => $q->where('status', $status))
            ->when($request->query('supplier_id'), fn ($q, $id) => $q->where('supplier_id', $id))
            ->latest()
            ->paginate($perPage);

        return PurchaseInvoiceResource::collection($invoices);
    }

    public function show(PurchaseInvoice $purchaseInvoice): PurchaseInvoiceResource
    {
        return new PurchaseInvoiceResource(
            $purchaseInvoice->load([
                'purchaseOrder', 'supplier', 'creator',
                'lines.purchaseOrderLine.product', 'lines.purchaseOrderLine.variant',
            ])
        );
    }

    public function store(StorePurchaseInvoiceRequest $request): PurchaseInvoiceResource
    {
        $data = $request->validated();

        $purchaseOrder = PurchaseOrder::findOrFail($data['purchase_order_id']);

        if ($purchaseOrder->status !== 'ouverte') {
            throw ValidationException::withMessages([
                'purchase_order_id' => "Cette commande d'achat n'est plus ouverte.",
            ]);
        }

        $invoice = DB::transaction(function () use ($data, $request, $purchaseOrder) {
            $total = 0;
            $linesToCreate = [];

            foreach ($data['lines'] as $line) {
                $orderLine = PurchaseOrderLine::where('id', $line['purchase_order_line_id'])
                    ->where('purchase_order_id', $purchaseOrder->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $billable = $orderLine->quantity_ordered - $orderLine->quantity_invoiced;

                if ($line['quantity'] > $billable) {
                    throw ValidationException::withMessages([
                        'lines' => "Quantité facturée supérieure à la quantité facturable restante pour la ligne #{$orderLine->id}.",
                    ]);
                }

                $lineTotal = $line['quantity'] * $orderLine->unit_price;
                $total += $lineTotal;

                $linesToCreate[] = [
                    'purchase_order_line_id' => $orderLine->id,
                    'quantity' => $line['quantity'],
                    'unit_price' => $orderLine->unit_price,
                    'line_total' => $lineTotal,
                ];

                $orderLine->increment('quantity_invoiced', $line['quantity']);
            }

            $attachmentPath = null;
            if ($request->hasFile('attachment')) {
                $attachmentPath = Storage::disk('public')->url(
                    $request->file('attachment')->store('purchase-invoices', 'public')
                );
            }

            $invoice = PurchaseInvoice::create([
                'code' => 'FA-'.str_pad((string) (PurchaseInvoice::max('id') + 1), 5, '0', STR_PAD_LEFT),
                'purchase_order_id' => $purchaseOrder->id,
                'supplier_id' => $purchaseOrder->supplier_id,
                'currency' => $purchaseOrder->currency,
                'invoice_date' => $data['invoice_date'],
                'due_date' => $data['due_date'] ?? null,
                'reference' => $data['reference'] ?? null,
                'attachment_path' => $attachmentPath,
                'notes' => $data['notes'] ?? null,
                'status' => 'enregistrée',
                'is_paid' => false,
                'total' => $total,
                'created_by' => $request->user()?->id,
            ]);

            $invoice->lines()->createMany($linesToCreate);

            if (! $purchaseOrder->lines()->whereColumn('quantity_invoiced', '<', 'quantity_ordered')->exists()) {
                $purchaseOrder->update(['status' => 'fermée']);
            }

            return $invoice;
        });

        return new PurchaseInvoiceResource(
            $invoice->load(['purchaseOrder', 'supplier', 'creator', 'lines.purchaseOrderLine.product', 'lines.purchaseOrderLine.variant'])
        );
    }

    public function update(UpdatePurchaseInvoiceRequest $request, PurchaseInvoice $purchaseInvoice): PurchaseInvoiceResource
    {
        $purchaseInvoice->update(['is_paid' => $request->validated('is_paid')]);

        return new PurchaseInvoiceResource(
            $purchaseInvoice->fresh(['purchaseOrder', 'supplier', 'creator'])
        );
    }

    public function cancel(PurchaseInvoice $purchaseInvoice): PurchaseInvoiceResource
    {
        if ($purchaseInvoice->status === 'annulée') {
            throw ValidationException::withMessages([
                'status' => 'Cette facture est déjà annulée.',
            ]);
        }

        DB::transaction(function () use ($purchaseInvoice) {
            foreach ($purchaseInvoice->lines as $line) {
                $line->purchaseOrderLine()->decrement('quantity_invoiced', $line->quantity);
            }

            $purchaseOrder = $purchaseInvoice->purchaseOrder;
            if ($purchaseOrder->status === 'fermée') {
                $purchaseOrder->update(['status' => 'ouverte']);
            }

            $purchaseInvoice->update(['status' => 'annulée']);
        });

        return new PurchaseInvoiceResource(
            $purchaseInvoice->fresh(['purchaseOrder', 'supplier', 'creator'])
        );
    }
}
