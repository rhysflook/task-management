<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class FormTraitTest extends TestCase
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

        User::factory()->count(9)->sequence(
            ['is_active' => true],
            ['is_active' => false],
        )->create();

        Tag::factory()->count(10)->create([
            'name' => 'Test Tag',
        ]);
    }

    /**
     * A basic feature test example.
     */
    public function test_get_tag_options(): void
    {
        $response = $this->get('/api/projects/tags/options');

        $response->assertStatus(200);
        $response->assertJsonCount(10, 'data');
    }

    public function test_get_user_options(): void
    {
        $response = $this->get('/api/projects/users/options');
        $response->assertStatus(200);
        $response->assertJsonCount(6, 'data');
    }

    public function test_soft_delete_record(): void
    {
        $project = Project::factory()->create();

        $response = $this->delete('/api/projects/' . $project->id);

        $response->assertStatus(200);
        $this->assertSoftDeleted('projects', ['id' => $project->id]);
    }

    public function test_soft_delete_project_with_relations(): void
    {
        $project = Project::factory()->create();
        $project->tags()->attach(Tag::factory()->count(3)->create());

        $response = $this->delete('/api/projects/' . $project->id, [
            'relationships' => [
                'tags', 'users'
            ]
        ]);

        $response->assertStatus(200);
        $this->assertSoftDeleted('projects', ['id' => $project->id]);
        $this->assertDatabaseMissing('project_tag', ['project_id' => $project->id]);
    }
}
