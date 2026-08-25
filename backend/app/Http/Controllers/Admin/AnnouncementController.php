<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Announcement\StoreAnnouncementRequest;
use App\Http\Requests\Announcement\UpdateAnnouncementRequest;
use App\Http\Resources\AnnouncementResource;
use App\Models\Announcement;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AnnouncementController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $announcements = Announcement::query()->orderBy('position')->get();

        return AnnouncementResource::collection($announcements);
    }

    public function show(Announcement $announcement): AnnouncementResource
    {
        return new AnnouncementResource($announcement);
    }

    public function store(StoreAnnouncementRequest $request): AnnouncementResource
    {
        $data = $request->validated();
        $data['position'] = ((int) Announcement::max('position')) + 1;

        $announcement = Announcement::create($data);

        return new AnnouncementResource($announcement->fresh());
    }

    public function update(UpdateAnnouncementRequest $request, Announcement $announcement): AnnouncementResource
    {
        $announcement->update($request->validated());

        return new AnnouncementResource($announcement->fresh());
    }

    public function destroy(Announcement $announcement)
    {
        $announcement->delete();

        return response()->json(null, 204);
    }
}
