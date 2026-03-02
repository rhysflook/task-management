<?php
namespace App\Http\Controllers;

use App\Concerns\HasForm;
use App\Concerns\HasTable;
use App\Enums\PatientStatus;
use App\Http\Resources\PatientCollection;
use App\Http\Resources\PatientResource;
use App\Models\Patient;
use Illuminate\Contracts\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    use HasTable, HasForm {
        HasForm::createRecord as protected baseCreateRecord;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    public function createRecord(Request $request)
    {
        $record = $this->baseCreateRecord($request);
                
        return [
            // macthing format with staffController (used in Create.jsx)
            'data' => [
                'record' => $record,
                'extra_data' => $this->getExtraData(),
            ]
        ];
    }

    public function modifyFormDataResponse($data)
    {
        $data['options'] = [
            ...$data['options'],
            'section' => $this->getExtraData()['section_options'] ?? [],
        ];
        return $data;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Patient $patient)
    {
        return new PatientResource($patient);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Patient $patient)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Patient $patient)
    {
        //
    }

    public function afterCreate(Request $request, $record)
    {
        $record->bed->status = \App\Enums\BedStatus::OCCUPIED;
        $record->bed->save();
        $record->admissions()->create([]);
    }

    public function beforeUpdate(Request $request)
    {
        $patient = $this->resolveModelInstance();
        if (
            $request->has('discharge_day') && 
            $request->input('discharge_day') && 
            $patient->discharge_day != $request->input('discharge_day') &&
            $request->input('section') == PatientStatus::DISCHARGED->value
        ) {
            $patient->discharges()->create([]);
        }

        if (
            $request->has('admission_day') && 
            $request->input('admission_day') && 
            $patient->admission_day != $request->input('admission_day') &&
            $request->input('section') == PatientStatus::ADMITTED->value
        ) {
            $patient->admissions()->create([]);
        }

    }

    public function afterUpdate(Request $request, $record)
    {
        if ($request->input('outing_start') || $request->input('outing_end')) {
            $record->patientOutings()->create([
                'outing_start' => $request->input('outing_start'),
                'outing_end' => $request->input('outing_end'),
            ]);
            if (!$request->input('outing_end')) {
                $record->bed->status = \App\Enums\BedStatus::OUTING;
            } else {
                $record->bed->status = \App\Enums\BedStatus::OCCUPIED;
            }
        }

        if ($request->has('discharge_day') && $request->input('discharge_day') && $record->bed) {
            $record->bed->status = \App\Enums\BedStatus::AVAILABLE;
            $record->bed->save();
            $record->bed()->dissociate();
            $record->save();
        }

        if ($request->has('section') && $request->input('section') == PatientStatus::VACANT->value && $record->bed) {
            $record->bed->status = \App\Enums\BedStatus::AVAILABLE;
            $record->bed->save();
            $record->bed()->dissociate();
            $record->save();
        } elseif ($request->has('section') && $request->input('section') == PatientStatus::ADMITTED->value && $record->bed) {
            $record->bed->status = \App\Enums\BedStatus::OCCUPIED;
            $record->bed->save();
        }



        // $this->handleRelationships($record, $request->input('relationships', []));
        return $record;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Patient $patient)
    {
        //
    }

    public function canDeleteRecord(Request $request, Patient $patient)
    {
        // if (/*Put condition when needed*/) {
        //     return response()->json([
        //         'can_delete' => false,
        //         'message' => 'Cannot delete patient.'
        //     ]);
        // } else {
            return response()->json([
                'can_delete' => $patient->section == 4,
                'message' => 'Staff can be deleted.'
            ]);
        // }
    }

    public function setRoomOptionData($item)
    {
        return [
            'unit_id' => $item->unit_id,            
        ];
    }

    public function setBedOptionData($item)
    {
        return [
            'room_id' => $item->room_id,            
        ];
    }

    public function modifyBedOptionQuery(Builder &$query)
    {
        $currentBedId = $this->resolveModelInstance()?->bed_id;

        $query->where(function ($q) use ($currentBedId) {
            // Beds with no patient
            $q->whereDoesntHave('patient');

            // OR the bed assigned to the current patient
            if ($currentBedId) {
                $q->orWhere('id', $currentBedId);
            }
        })->orderBy('bed_no', 'asc');
    }

    public function setBed(Request $request, Patient $patient)
    {
        $request->validate([
            'bed_id' => 'required|exists:beds,id',
        ]);

        $bed = \App\Models\Bed::find($request->input('bed_id'));

        // Update bed status
        if ($patient->bed_id) {
            $oldBed = \App\Models\Bed::find($patient->bed_id);
            $oldBed->status = \App\Enums\BedStatus::AVAILABLE;
            $oldBed->save();
        }

        $bed->status = \App\Enums\BedStatus::OCCUPIED;
        $bed->save();

        // Assign new bed to patient
        $patient->bed_id = $bed->id;
        $patient->room_id = $bed->room_id;
        $patient->unit_id = $bed->room->unit_id;
        $patient->save();

        return response()->json([
            'message' => 'Bed assigned successfully',
            'patient' => new PatientResource($patient),
        ]);
    }

    public function getStagedPatients(Request $request)
    {
        $stagedPatients = Patient::whereNull('bed_id')
            ->where('section', '<>', PatientStatus::DISCHARGED->value)
            ->get();

        return (new PatientCollection($stagedPatients))->withPagination(false);
    }

    public function getInCallPatients(Request $request)
    {
        $inCallPatients = Patient::whereNotNull('bed_id')
            ->where('section', '<>', PatientStatus::DISCHARGED->value)
            ->whereHas('activeCall')
            ->get();

        return (new PatientCollection($inCallPatients))->withPagination(false);
    }

    public function stagePatient(Request $request, Patient $patient)
    {
        // Logic to stage the patient (e.g., mark as ready for transfer)
        $patient->bed->status = \App\Enums\BedStatus::AVAILABLE;
        $patient->bed->save();
        $patient->bed_id = null;
        $patient->section = PatientStatus::VACANT->value; // Update section to VACANT
        $patient->save();

        return response()->json([
            'message' => 'Patient staged successfully',
        ]);
    }

    public function unstagePatient(Request $request, Patient $patient)
    {
        // Logic to unstage the patient (e.g., assign to a bed)
        $bedId = $request->input('bed_id');
        $bed = \App\Models\Bed::find($bedId);

        if ($bed) {
            $bed->status = \App\Enums\BedStatus::OCCUPIED;
            $bed->save();

            $patient->bed_id = $bed->id;
            $patient->room_id = $bed->room_id;
            $patient->unit_id = $bed->room->unit_id;
            $patient->section = PatientStatus::ADMITTED->value; // Update section to ADMITTED
            $patient->save();

            return response()->json([
                'message' => 'Patient unstaged successfully',
                'patient' => new PatientResource($patient),
            ]);
        } else {
            return response()->json([
                'message' => 'Invalid bed ID',
            ], 400);
        }
    }

    public function modifySectionOptionQuery(Builder &$query)
    {
        $query->whereIn('value', [PatientStatus::ADMITTED->value]);
    }

    public function getExtraData()
    {

        if (request()->route('id') || request()->get('record')) {
            \Log::info('Getting extra data for patient with ID: ' . request()->route('id')); // Debug log
            $id = request()->route('id') ?? request()->get('record');
            $patient = Patient::find($id);
            $sections = [];
            \Log::info('Patient section: ' . $patient->section);

            switch ($patient->section) {
                case (string) PatientStatus::VACANT->value:
                    \Log::info('Patient is in VACANT section, setting options to VACANT and ADMITTED'); // Debug log
                    $sections = [
                        ['id' => (string) PatientStatus::VACANT->value, 'name' => PatientStatus::VACANT->label()],
                        ['id' => (string) PatientStatus::ADMITTED->value, 'name' => PatientStatus::ADMITTED->label()]
                    ];
                    break;
                case (string) PatientStatus::ADMITTED->value:
                    \Log::info('Patient is in ADMITTED section, setting options to ADMITTED, OUTING, and DISCHARGED'); // Debug log
                    $sections = [
                        ['id' => (string) PatientStatus::ADMITTED->value, 'name' => PatientStatus::ADMITTED->label()],
                        ['id' => (string) PatientStatus::OUTING->value, 'name' => PatientStatus::OUTING->label()],
                        ['id' => (string) PatientStatus::DISCHARGED->value, 'name' => PatientStatus::DISCHARGED->label()]
                    ];
                    break;
                default:
                    \Log::info('Patient is in default section, setting options to ADMITTED and current section'); // Debug log
                    $sections = [
                        ['id' => (string) PatientStatus::ADMITTED->value, 'name' => PatientStatus::ADMITTED->label()],
                        ['id' => $patient->section, 'name' => PatientStatus::from($patient->section)->label()]
                    ];
                    break;
            }

            return [
                'next_patient_no' => Patient::generatePatientNumber(),
                'section_options' => $sections,
            ];
        }
        \Log::info('No patient ID in route, returning default section options'); // Debug log
        return [
            'next_patient_no' => Patient::generatePatientNumber(),
            'section_options' => [['id' => (string) PatientStatus::VACANT->value, 'name' => PatientStatus::VACANT->label()], ['id' => (string) PatientStatus::ADMITTED->value, 'name' => PatientStatus::ADMITTED->label()]],
        ];
    }

    public function modifyTableQuery(&$query)
    {
        $query->where('section', '<>', PatientStatus::DISCHARGED->value);
    }

    public function modifyUnitOptionQuery(Builder &$query)
    {
         $query->orderBy('unit_no');
    }

    public function modifyRoomOptionQuery(Builder &$query)
    {
        $query->where('is_utility', false)->orderBy('name', 'asc');
    }
}
