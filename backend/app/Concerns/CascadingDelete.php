<?php

namespace App\Concerns;

use Illuminate\Database\Eloquent\Model as EloquentModel;

trait CascadingDelete
{
    public static function bootCascadingDelete(): void
    {
        static::deleting(function ($model) {
            $deletesByClass = [];

            $model->collectCascadeDeletes($deletesByClass);

            if (empty($deletesByClass)) {
                return;
            }

            EloquentModel::withoutEvents(function () use ($deletesByClass) {
                foreach ($deletesByClass as $class => $ids) {
                    $ids = array_unique($ids);

                    $class::whereKey($ids)->delete();
                }
            });
        });
    }

    /**
     * Recursively collect IDs of related models to delete.
     *
     * @param array<string, array<int|string>> $deletesByClass
     */
    public function collectCascadeDeletes(array &$deletesByClass): void
    {
        // If the model doesn't define $cascadingDeletes, nothing to do
        if (!property_exists($this, 'cascadingDeletes') || !is_array($this->cascadingDeletes)) {
            return;
        }

        foreach ($this->cascadingDeletes as $relationship) {
            if (!method_exists($this, $relationship)) {
                continue;
            }

            $relation = $this->{$relationship}();
            $related  = $relation->get();

            foreach ($related as $record) {
                $class = get_class($record);

                $deletesByClass[$class][] = $record->getKey();

                if (in_array(CascadingDelete::class, class_uses_recursive($record), true)) {
                    $record->collectCascadeDeletes($deletesByClass);
                }
            }
        }
    }
}
