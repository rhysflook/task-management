<?php

namespace Tests\Feature;

use App\Models\Project;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class TableTraitTest extends TestCase
{
    use RefreshDatabase;
    public $route = '/api/projects/tableData';

    public function setUp(): void
    {
        parent::setUp();
        $user = \App\Models\User::factory()->create();
        $this->actingAs($user);
        Project::factory()->count(127)->create();
        $this->records = Project::query()->orderBy('id')->get();
    }
    /**
     * A basic feature test example.
     */
    public function test_get_correct_entries_specific_page(): void
    {
        // test for 5 per page
        $response = $this->get($this->route . "?page=2&per_page=5&fields=name,code,description");
        $response->assertStatus(200);
        $response->assertJsonCount(5, 'data');

    $expectedRecords = $this->records->slice(5, 5)->values()->toArray();
        foreach ($expectedRecords as $key => $record) {
            $this->assertEquals($record['code'], $response->json('data.' . $key . '.code'), count($this->records));
        }

        // test for 10 per page
        $response = $this->get($this->route . "?page=4&per_page=10&fields=name,code,description");
        $response->assertStatus(200);
        $response->assertJsonCount(10, 'data');

        $expectedRecords = $this->records->slice(30, 10)->values()->toArray();


        foreach ($expectedRecords as $key => $record) {
            $this->assertEquals($record['code'], $response->json('data.' . $key . '.code'));
        }
        // test for 20 per page

        $response = $this->get($this->route . "?page=3&per_page=20&fields=name,code,description");
        $response->assertStatus(200);
        $response->assertJsonCount(20, 'data');

        $expectedRecords = $this->records->slice(40, 20)->values()->toArray();

        foreach ($expectedRecords as $key => $record) {
            $this->assertEquals($record['code'], $response->json('data.' . $key . '.code'));
        }
    }


    public function test_last_page_shows_correct_number_of_entries(): void
    {
        // test for 5 per page
        $response = $this->get($this->route . "?page=26&per_page=5&fields=name,code,description");
        $response->assertStatus(200);
        $response->assertJsonCount(2, 'data');
        // test for 10 per page
        $response = $this->get($this->route . "?page=13&per_page=10&fields=name,code,description");
        $response->assertStatus(200);
        $response->assertJsonCount(7, 'data');

        // test for 20 per page
        $response = $this->get($this->route . "?page=7&per_page=20&fields=name,code,description");
        $response->assertStatus(200);
        $response->assertJsonCount(7, 'data');
    }

    public function test_check_correct_fields_returned(): void
    {
        $response = $this->get($this->route . "?page=1&per_page=5&fields=name,code,description");
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'name',
                    'code',
                    'description',
                ],
            ],
        ]);
    }
}
