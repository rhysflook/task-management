<?php

namespace App\Http\Resources;

use App\Enums\TaskStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $tasks = $this->tasks;
        $counts_by_status = $tasks->groupBy('status')->mapWithKeys(function ($group, $status) {
            return [TaskStatus::tryFrom($status)?->jsonKey() => $group->count()];
        })->toArray();
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'description' => $this->description,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'tasks' => [
                'total' => $tasks->count(),
                'unassigned' => $tasks->where('status', TaskStatus::UNASSIGNED->value)->count(),
                'assigned' => $tasks->where('status', TaskStatus::ASSIGNED->value)->count(),
                'active' => $tasks->where('status', TaskStatus::ACTIVE->value)->count(),
                'completed' => $tasks->where('status', TaskStatus::COMPLETED->value)->count(),
                'on_hold' => $tasks->where('status', TaskStatus::ON_HOLD->value)->count(),
                'cancelled' => $tasks->where('status', TaskStatus::CANCELLED->value)->count(),
                'archived' => $tasks->where('status', TaskStatus::ARCHIVED->value)->count(),
            ],
            'tags' => $this->tags->map(function ($tag) {
                return [
                    'id' => $tag->id,
                    'name' => $tag->name,
                ];
            }),
            'users' => $this->users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                ];
            }),
        ];
    }
}
