<?php

namespace App\Concerns;

use App\Http\Resources\ProjectResource;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

trait HasForm
{
    /**
     * Get the options for a given relationship.
     *
     * Converts the supplied relationship to its singular capitalized form in order to get the correct model name.
     * By default it will return all records of the target model in array form.
     *
     * In order to allow filtering of the records for specific models, the method `modify[capitalized relationship name]OptionQuery` can be defined in the controller.
     *
     * @param string $relationship
     * @return array
     */
    public function getOptions(string $relationship): array
    {
        $capitalizedRelationship = ucfirst($relationship);
        $relationship = \Str::singular($capitalizedRelationship);
        $model = "App\\Models\\$relationship";

        $query = $model::query();
        if (method_exists($this, "modify{$capitalizedRelationship}OptionQuery")) {
            $this->{"modify{$capitalizedRelationship}OptionQuery"}($query);
        }

        return $query->get()->map(function ($item) {
            return ['id' => $item->id, 'name' => $item->name];
        })->toArray();
    }

    /**
     * Get the options for a given relationship in JSON format.
     *
     * @param string $relationship
     * @return \Illuminate\Http\JsonResponse
     */
    public function getOptionsJson($relationship)
    {
        return response()->json(['data' => $this->getOptions($relationship)], 200);
    }

    public function createRecord(Request $request)
    {
        return $this->handleTransaction(function() use ($request) {
            $modelName = $this->getModelName();
            $model = "App\\Models\\$modelName";
            $this->handleValidation($modelName, $request);

            // beforeCreate hook

            $record = $model::create($request->all());

            // beforeRelationshipCreation hook

            $this->handleRelationships($record, $request->input('relationships', []));
            return $record;
            // afterCreation hook
        },
            'Successfully created record',
            'Failed to create record',
            201
        );
    }

    public function editRecord(Request $request)
    {
        return $this->handleTransaction(function() use ($request) {
            $modelName = $this->getModelName();
            $model = "App\\Models\\$modelName";
            $this->handleValidation($modelName, $request);

            // beforeCreate hook

            $record = tap($model::find($request->route('id')), function($record) use ($request) {
                $record->update($request->all());
            });

            // beforeRelationshipCreation hook

            $this->handleRelationships($record, $request->input('relationships', []));
            return $record;
            // afterCreation hook
        },
            'Successfully updated record',
            'Failed to updated record',
        );
    }

    public function deleteRecord(Request $request)
    {
        return $this->handleTransaction(function() use ($request) {
            $modelName = $this->getModelName();
            $model = "App\\Models\\$modelName";
            $record = $model::find($request->route('id'));
            if ($record) {
                $this->deleteRelationships($record, $request->input('relationships', []));
                $record->delete();
                return $record;
            }
            return response()->json(['message' => 'Record not found'], 404);
        },
            'Successfully deleted record',
            'Failed to delete record',
        );
    }

    public function handleValidation(string $model, $request)
    {
        // Construct the FormRequest class name dynamically.
        $formRequestClass = 'App\\Http\\Requests\\' . \Str::studly($model) . 'Request';

        // Check if the class exists, and instantiate it.
        if (class_exists($formRequestClass)) {
            app()->make($formRequestClass)->validateResolved();
            return;
        }

        // Fallback in case the form request class doesn't exist
        throw new \Exception("FormRequest class {$formRequestClass} does not exist.");
    }

    public function handleRelationships($record, $relationships)
    {
        foreach ($relationships as $relationship => $ids) {
            $relationshipType = get_class($record->$relationship());
            if ($relationshipType == 'Illuminate\Database\Eloquent\Relations\BelongsToMany') {
                $record->$relationship()->sync($ids);
            } elseif ($relationshipType == 'Illuminate\Database\Eloquent\Relations\HasMany') {
                $record->$relationship()->sync($ids);
            } elseif ($relationshipType == 'Illuminate\Database\Eloquent\Relations\HasOne') {
                $record->$relationship()->create($ids[0]);
            } elseif ($relationshipType == 'Illuminate\Database\Eloquent\Relations\BelongsTo') {
                $record->$relationship()->associate($ids[0]);
            }
        }
    }

    public function deleteRelationships($record, $relationships)
    {
        foreach ($relationships as $relationship) {
            $relationshipType = get_class($record->$relationship());
            if ($relationshipType == 'Illuminate\Database\Eloquent\Relations\BelongsToMany') {
                $record->$relationship()->detach();
            } elseif ($relationshipType == 'Illuminate\Database\Eloquent\Relations\HasMany') {
                $record->$relationship()->delete();
            } elseif ($relationshipType == 'Illuminate\Database\Eloquent\Relations\HasOne') {
                $record->$relationship()->delete();
            } elseif ($relationshipType == 'Illuminate\Database\Eloquent\Relations\BelongsTo') {
                $record->$relationship()->dissociate();
                $record->save();
            }
        }
    }

    public function getRelationshipOptions(Request $request)
    {
        if ($request->has('relationships')) {
            $options = [];
            foreach (explode(",", $request->input('relationships')) as $relationship) {
                $options[$relationship] = $this->getOptions($relationship);
            }
        }

        return $options ?? [];
    }

    public function getFormData(Request $request)
    {
        $id = $request->route('id'); // Retrieve 'id' from route parameters
        return response()->json([
            'data' => [
                'id' => $id,
                'options' => $this->getRelationshipOptions($request),
                'record' => $id ? new ProjectResource(Project::find($id)) : null,
            ],
        ]);
    }

    public function getModelName()
    {
        return str_replace("Controller", "", class_basename(static::class));
    }

    public function handleTransaction($callback, $successMsg, $errorMsg, $successCode = 200)
    {
        DB::beginTransaction();
        try {
            $result = $callback();
            DB::commit();
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Throwable $th) {
            dd($th);
            \Log::error($th);
            DB::rollBack();
            return response()->json([
            'error' => $errorMsg,
            'message' => $th->getMessage(),
            ], 500);
        }

        return response()->json([
            'data' => $result,
            'message' => $successMsg,
        ], $successCode);
    }
}
