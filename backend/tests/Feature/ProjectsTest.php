<?php

namespace Tests\Feature;

use App\Enums\TaskStatus;
use App\Models\Project;
use App\Models\Tag;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Sequence;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ProjectsTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create([
            'role' => 2,
            'is_active' => true,
        ]);
        $this->actingAs($this->user);
        $this->projects = Project::factory()->count(10)->create();
        $this->withHeaders([
            'Accept' => 'application/json',
            'X-XSRF-TOKEN' => csrf_token(),
        ]);
    }
    /**
     * A basic feature test example.
     */
    public function test_get_specific_project(): void
    {
        $response = $this->get('/api/projects/' . $this->projects[3]->id);
        $response->assertStatus(200);

        $response->assertJson([
            'data' => [
                'id' => $this->projects[3]->id,
                'name' => $this->projects[3]->name,
                'description' => $this->projects[3]->description,
                'created_at' => $this->projects[3]->created_at->toISOString(),
                'updated_at' => $this->projects[3]->updated_at->toISOString(),
            ]
        ]);
    }

    public function test_deleted_project_not_retrieved(): void
    {
        $response = $this->get('/api/projects/' . $this->projects[3]->id);
        $response->assertStatus(200);

        $this->projects[3]->delete();

        $response = $this->get('/api/projects/' . $this->projects[3]->id);
        $response->assertStatus(404);
    }

    public function test_projects_task_count_correct()
    {
        $response = $this->get('/api/projects/' . $this->projects[3]->id);
        $response->assertStatus(200);

        Task::factory()->for($this->projects[3])->count(7)->create();

        $response = $this->get('/api/projects/' . $this->projects[3]->id);
        $response->assertStatus(200);

        $response->assertJson([
            'data' => [
                'tasks' => [
                    'total' => 7,
                ]
            ]
        ]);
    }

    public function test_specific_task_count_correct()
    {
        $response = $this->get('/api/projects/' . $this->projects[3]->id);
        $response->assertStatus(200);

        Task::factory()->for($this->projects[3])->count(19)->state(new Sequence(
            ['status' => TaskStatus::UNASSIGNED->value],
            ['status' => TaskStatus::ON_HOLD->value],
            ['status' => TaskStatus::ACTIVE->value],
            ['status' => TaskStatus::UNASSIGNED->value],
            ['status' => TaskStatus::ACTIVE->value],
            ['status' => TaskStatus::UNASSIGNED->value],
            ['status' => TaskStatus::COMPLETED->value],
            ['status' => TaskStatus::UNASSIGNED->value],
            ['status' => TaskStatus::ON_HOLD->value],
            ['status' => TaskStatus::ACTIVE->value],
            ['status' => TaskStatus::UNASSIGNED->value],
            ['status' => TaskStatus::ACTIVE->value],
            ['status' => TaskStatus::UNASSIGNED->value],
            ['status' => TaskStatus::COMPLETED->value],
            ['status' => TaskStatus::COMPLETED->value],
            ['status' => TaskStatus::ASSIGNED->value],
            ['status' => TaskStatus::ASSIGNED->value],
            ['status' => TaskStatus::ASSIGNED->value],
            ['status' => TaskStatus::UNASSIGNED->value],
        ))->create();

        $response = $this->get('/api/projects/' . $this->projects[3]->id);
        $response->assertStatus(200);

        $response->assertJson([
            'data' => [
                'tasks' => [
                    'total' => 19,
                    'unassigned' => 7,
                    'assigned' => 3,
                    'active' => 4,
                    'completed' => 3,
                    'on_hold' => 2,
                    'cancelled' => 0,
                    'archived' => 0,
                ]
            ]
        ]);
    }

    public function test_create_new_project()
    {
        $response = $this->post('/api/projects/create', [
            'name' => 'Test Project',
            'code' => 'TP',
            'user_id' => $this->user->id,
            'description' => 'Test project description',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('projects', [
            'name' => 'Test Project',
            'code' => 'TP',
            'description' => 'Test project description',
            'status' => 1,
        ]);
    }

    public function test_create_new_project_with_tags()
    {
        Tag::factory()->count(3)->create([
            'name' => 'Test Tag',
        ]);
        $response = $this->post('/api/projects/create', [
            'name' => 'Test Project',
            'code' => 'TP',
            'user_id' => $this->user->id,
            'description' => 'Test project description',
            'relationships' => ['tags' => Tag::all()->pluck('id')->toArray()],
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('projects', [
            'name' => 'Test Project',
            'code' => 'TP',
            'description' => 'Test project description',
            'status' => 1,
        ]);

        $this->assertDatabaseCount('project_tag', 3);
    }

    public function test_create_new_project_with_users()
    {
        $users = User::factory()->count(3)->create([
            'role' => 2,
            'is_active' => true,
        ]);
        $response = $this->post('/api/projects/create', [
            'name' => 'Test Project',
            'user_id' => $this->user->id,
            'code' => 'TP',
            'description' => 'Test project description',
            'relationships' => ['users' => $users->pluck('id')->toArray()],
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('projects', [
            'name' => 'Test Project',
            'code' => 'TP',
            'description' => 'Test project description',
            'status' => 1,
        ]);

        $this->assertDatabaseCount('project_user', 3);
    }

    public function test_create_new_project_with_tags_and_users()
    {
        Tag::factory()->count(3)->create([
            'name' => 'Test Tag',
        ]);
        $users = User::factory()->count(3)->create([
            'role' => 2,
            'is_active' => true,
        ]);
        $response = $this->post('/api/projects/create', [
            'name' => 'Test Project',
            'user_id' => $this->user->id,
            'code' => 'TP',
            'description' => 'Test project description',
            'relationships' => [
                'tags' => Tag::all()->pluck('id')->toArray(),
                'users' => $users->pluck('id')->toArray(),
            ]
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('projects', [
            'name' => 'Test Project',
            'code' => 'TP',
            'description' => 'Test project description',
            'status' => 1,
        ]);

        $this->assertDatabaseCount('project_tag', 3);
        $this->assertDatabaseCount('project_user', 3);
    }

    public function test_project_required_fields_trigger_validation_errors()
    {
        $response = $this->post('/api/projects/create', [
            'name' => '',
            'code' => '',
            'user_id' => $this->user->id,
            'description' => '',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['name', 'code', 'description']);
    }

    public function test_project_code_unique_triggers_validation_error()
    {
        $this->post('/api/projects/create', [
            'name' => 'Test Project',
            'user_id' => $this->user->id,
            'code' => 'TP',
            'description' => 'Test project description',
        ]);

        $response = $this->post('/api/projects/create', [
            'name' => 'Test Project 2',
            'user_id' => $this->user->id,
            'code' => 'TP',
            'description' => 'Test project description 2',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['code']);
    }

    public function test_update_project()
    {
        $response = $this->put('/api/projects/' . $this->projects[3]->id . '/save', [
            'name' => 'Updated Project',
            'code' => 'UP',
            'user_id' => $this->user->id,
            'description' => 'Updated project description',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('projects', [
            'name' => 'Updated Project',
            'code' => 'UP',
            'description' => 'Updated project description',
            'status' => 1,
        ]);
    }

    public function test_update_project_with_tags()
    {
        Tag::factory()->count(3)->create([
            'name' => 'Test Tag',
        ]);
        $response = $this->put('/api/projects/' . $this->projects[3]->id . '/save', [
            'name' => 'Updated Project',
            'code' => 'UP',
            'user_id' => $this->user->id,
            'description' => 'Updated project description',
            'relationships' => ['tags' => Tag::all()->pluck('id')->toArray()],
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('projects', [
            'name' => 'Updated Project',
            'code' => 'UP',
            'description' => 'Updated project description',
            'status' => 1,
        ]);

        $this->assertDatabaseCount('project_tag', 3);
    }

    public function test_update_project_with_users()
    {
        $users = User::factory()->count(3)->create([
            'role' => 2,
            'is_active' => true,
        ]);
        $response = $this->put('/api/projects/' . $this->projects[3]->id . '/save', [
            'name' => 'Updated Project',
            'user_id' => $this->user->id,
            'code' => 'UP',
            'description' => 'Updated project description',
            'relationships' => ['users' => $users->pluck('id')->toArray()],
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('projects', [
            'name' => 'Updated Project',
            'code' => 'UP',
            'description' => 'Updated project description',
            'status' => 1,
        ]);

        $this->assertDatabaseCount('project_user', 3);
    }

    public function test_add_and_delete_tags()
    {
        $tags = Tag::factory()->count(3)->create([
            'name' => 'Test Tag',
        ]);
        $response = $this->put('/api/projects/' . $this->projects[3]->id . '/save', [
            'name' => 'Updated Project',
            'code' => 'UP',
            'user_id' => $this->user->id,
            'description' => 'Updated project description',
            'relationships' => ['tags' => $tags->pluck('id')->toArray()],
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('projects', [
            'name' => 'Updated Project',
            'code' => 'UP',
            'description' => 'Updated project description',
            'status' => 1,
        ]);

        $this->assertDatabaseCount('project_tag', 3);

        // delete tags
        $response = $this->put('/api/projects/' . $this->projects[3]->id . '/save', [
            'name' => 'Updated Project',
            'code' => 'UP',
            'user_id' => $this->user->id,
            'description' => 'Updated project description',
            'relationships' => ['tags' => ['tags' => $tags->pluck('id')->toArray()[0]]],
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseCount('project_tag', 1);
    }
}
