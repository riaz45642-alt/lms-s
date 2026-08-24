<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DirectMessage;
use App\Models\SchoolClass;
use App\Models\StudentProfile;
use App\Models\Subject;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class LmsFeatureController extends Controller
{
    public function courses(Request $request)
    {
        $query = DB::table('courses')->leftJoin('subjects', 'subjects.id', '=', 'courses.subject_id')
            ->leftJoin('course_enrollments', fn ($join) => $join->on('course_enrollments.course_id', '=', 'courses.id')->where('course_enrollments.user_id', $request->user()->id))
            ->where('courses.is_published', true)->select('courses.*', 'subjects.name as subject', 'course_enrollments.progress', 'course_enrollments.completed_at')
            ->selectSub(fn ($q) => $q->from('lessons')->selectRaw('count(*)')->whereColumn('lessons.course_id', 'courses.id')->where('is_published', true), 'lessons_count');
        if ($request->filled('q')) $query->where(fn ($q) => $q->where('courses.title', 'like', '%'.$request->q.'%')->orWhere('courses.description', 'like', '%'.$request->q.'%'));
        if ($request->filled('subject')) $query->where('subjects.name', $request->subject);
        return $query->orderBy('courses.title')->paginate(12);
    }

    public function course(Request $request, int $id)
    {
        $course = DB::table('courses')->where('id', $id)->where(fn ($q) => $q->where('is_published', true)->orWhere('created_by', $request->user()->id))->first();
        abort_unless($course, 404);
        $course->lessons = DB::table('lessons')->leftJoin('lesson_completions', fn ($join) => $join->on('lesson_completions.lesson_id', '=', 'lessons.id')->where('lesson_completions.user_id', $request->user()->id))
            ->where('course_id', $id)->where('is_published', true)->orderBy('position')->select('lessons.*', 'lesson_completions.completed_at')->get();
        $course->enrollment = DB::table('course_enrollments')->where(['course_id' => $id, 'user_id' => $request->user()->id])->first();
        return response()->json($course);
    }

    public function storeCourse(Request $request)
    {
        $this->admin($request); $d=$request->validate(['title'=>['required','string','max:255'],'description'=>['nullable','string'],'subject_id'=>['nullable','exists:subjects,id'],'grade_level'=>['nullable','string','max:50'],'difficulty'=>['required',Rule::in(['beginner','intermediate','advanced'])],'is_published'=>['boolean'],'lessons'=>['sometimes','array'],'lessons.*.title'=>['required','string','max:255'],'lessons.*.summary'=>['nullable','string'],'lessons.*.content'=>['nullable','string'],'lessons.*.duration_minutes'=>['nullable','integer','min:0','max:1440']]);
        return DB::transaction(function()use($request,$d){$id=DB::table('courses')->insertGetId(['created_by'=>$request->user()->id,'subject_id'=>$d['subject_id']??null,'title'=>$d['title'],'slug'=>Str::slug($d['title']).'-'.Str::lower(Str::random(6)),'description'=>$d['description']??null,'grade_level'=>$d['grade_level']??null,'difficulty'=>$d['difficulty'],'is_published'=>$d['is_published']??false,'created_at'=>now(),'updated_at'=>now()]);foreach($d['lessons']??[] as $i=>$lesson)DB::table('lessons')->insert($lesson+['course_id'=>$id,'position'=>$i+1,'is_published'=>$d['is_published']??false,'created_at'=>now(),'updated_at'=>now()]);return response()->json(DB::table('courses')->find($id),201);});
    }

    public function enroll(Request $request, int $id)
    {
        abort_unless(DB::table('courses')->where(['id' => $id, 'is_published' => true])->exists(), 404);
        DB::table('course_enrollments')->updateOrInsert(['course_id' => $id, 'user_id' => $request->user()->id], ['started_at' => now(), 'updated_at' => now(), 'created_at' => now()]);
        $this->activity($request->user()->id, 'started', 'course', $id);
        return response()->json(['message' => 'Course added to your learning journey.'], 201);
    }

    public function completeLesson(Request $request, int $id)
    {
        $lesson = DB::table('lessons')->where('id', $id)->where('is_published', true)->first(); abort_unless($lesson, 404);
        DB::table('lesson_completions')->updateOrInsert(['lesson_id' => $id, 'user_id' => $request->user()->id], ['completed_at' => now(), 'updated_at' => now(), 'created_at' => now()]);
        DB::table('course_enrollments')->updateOrInsert(['course_id' => $lesson->course_id, 'user_id' => $request->user()->id], ['started_at' => now(), 'updated_at' => now(), 'created_at' => now()]);
        $total = DB::table('lessons')->where(['course_id' => $lesson->course_id, 'is_published' => true])->count();
        $done = DB::table('lesson_completions')->join('lessons','lessons.id','=','lesson_completions.lesson_id')->where(['lessons.course_id'=>$lesson->course_id,'lesson_completions.user_id'=>$request->user()->id])->count();
        $progress = $total ? (int) round($done / $total * 100) : 0;
        DB::table('course_enrollments')->where(['course_id'=>$lesson->course_id,'user_id'=>$request->user()->id])->update(['progress'=>$progress,'completed_at'=>$progress === 100 ? now() : null,'updated_at'=>now()]);
        if ($progress === 100) DB::table('certificates')->updateOrInsert(['user_id'=>$request->user()->id,'course_id'=>$lesson->course_id], ['code'=>(string) Str::uuid(),'issued_at'=>now(),'created_at'=>now(),'updated_at'=>now()]);
        $this->activity($request->user()->id, 'completed', 'lesson', $id);
        return ['progress' => $progress, 'completed' => $progress === 100];
    }

    public function workbooks(Request $request)
    {
        return DB::table('workbooks')->where('is_published', true)->when($request->q, fn ($q,$v) => $q->where('title','like','%'.$v.'%'))
            ->select('*')->selectSub(fn ($q) => $q->from('workbook_worksheet')->selectRaw('count(*)')->whereColumn('workbook_id','workbooks.id'),'worksheets_count')->paginate(12);
    }

    public function workbook(Request $request, int $id)
    {
        $item = DB::table('workbooks')->where(['id'=>$id,'is_published'=>true])->first(); abort_unless($item,404);
        $item->worksheets = DB::table('worksheets')->join('workbook_worksheet','worksheets.id','=','workbook_worksheet.worksheet_id')->where('workbook_id',$id)->where('worksheets.is_published',true)->orderBy('position')->select('worksheets.id','title','subject','grade_level','description')->get();
        $this->activity($request->user()->id, 'viewed', 'workbook', $id); return response()->json($item);
    }
    public function storeWorkbook(Request $request){$this->admin($request);$d=$request->validate(['title'=>['required','string','max:255'],'description'=>['nullable','string'],'subject'=>['required','string','max:100'],'grade_level'=>['nullable','string','max:50'],'difficulty'=>['required',Rule::in(['beginner','intermediate','advanced'])],'is_published'=>['boolean'],'worksheet_ids'=>['sometimes','array'],'worksheet_ids.*'=>['integer','exists:worksheets,id']]);return DB::transaction(function()use($request,$d){$id=DB::table('workbooks')->insertGetId(['created_by'=>$request->user()->id,'title'=>$d['title'],'description'=>$d['description']??null,'subject'=>$d['subject'],'grade_level'=>$d['grade_level']??null,'difficulty'=>$d['difficulty'],'is_published'=>$d['is_published']??false,'created_at'=>now(),'updated_at'=>now()]);foreach($d['worksheet_ids']??[] as $i=>$wid)DB::table('workbook_worksheet')->insert(['workbook_id'=>$id,'worksheet_id'=>$wid,'position'=>$i+1]);return response()->json(DB::table('workbooks')->find($id),201);});}

    public function quizzes(Request $request)
    {
        return DB::table('quizzes')->where('is_published',true)->when($request->q,fn($q,$v)=>$q->where('title','like','%'.$v.'%'))
            ->select('*')->selectSub(fn($q)=>$q->from('quiz_questions')->selectRaw('count(*)')->whereColumn('quiz_id','quizzes.id'),'questions_count')->paginate(12);
    }

    public function quiz(Request $request, int $id)
    {
        $quiz = DB::table('quizzes')->where(['id'=>$id,'is_published'=>true])->first(); abort_unless($quiz,404);
        $quiz->questions = DB::table('quiz_questions')->where('quiz_id',$id)->orderBy('position')->get(['id','prompt','options','points'])->map(function($q){$q->options=json_decode($q->options,true);return $q;});
        $quiz->attempts_used = DB::table('quiz_attempts')->where(['quiz_id'=>$id,'user_id'=>$request->user()->id])->count(); return response()->json($quiz);
    }
    public function storeQuiz(Request $request){$this->admin($request);$d=$request->validate(['title'=>['required','string','max:255'],'description'=>['nullable','string'],'subject'=>['nullable','string','max:100'],'grade_level'=>['nullable','string','max:50'],'passing_score'=>['integer','min:0','max:100'],'max_attempts'=>['integer','min:1','max:20'],'is_published'=>['boolean'],'questions'=>['required','array','min:1'],'questions.*.prompt'=>['required','string'],'questions.*.options'=>['required','array','min:2'],'questions.*.correct_answer'=>['required','string'],'questions.*.explanation'=>['nullable','string'],'questions.*.points'=>['integer','min:1','max:100']]);return DB::transaction(function()use($request,$d){$id=DB::table('quizzes')->insertGetId(['created_by'=>$request->user()->id,'title'=>$d['title'],'description'=>$d['description']??null,'subject'=>$d['subject']??null,'grade_level'=>$d['grade_level']??null,'passing_score'=>$d['passing_score']??70,'max_attempts'=>$d['max_attempts']??3,'is_published'=>$d['is_published']??false,'created_at'=>now(),'updated_at'=>now()]);foreach($d['questions'] as $i=>$q){abort_unless(in_array($q['correct_answer'],$q['options'],true),422,'Every correct answer must be one of its question options.');DB::table('quiz_questions')->insert(['quiz_id'=>$id,'prompt'=>$q['prompt'],'options'=>json_encode($q['options']),'correct_answer'=>$q['correct_answer'],'explanation'=>$q['explanation']??null,'points'=>$q['points']??1,'position'=>$i+1,'created_at'=>now(),'updated_at'=>now()]);}return response()->json(DB::table('quizzes')->find($id),201);});}

    public function submitQuiz(Request $request, int $id)
    {
        $data=$request->validate(['answers'=>['required','array'],'answers.*'=>['nullable','string','max:500']]);
        $quiz=DB::table('quizzes')->where(['id'=>$id,'is_published'=>true])->first(); abort_unless($quiz,404);
        abort_if(DB::table('quiz_attempts')->where(['quiz_id'=>$id,'user_id'=>$request->user()->id])->count() >= $quiz->max_attempts,409,'No attempts remaining.');
        $questions=DB::table('quiz_questions')->where('quiz_id',$id)->get(); $score=0;$total=0;$feedback=[];
        foreach($questions as $q){$answer=$data['answers'][$q->id]??null;$total+=$q->points;$correct=(string)$answer===(string)$q->correct_answer;if($correct)$score+=$q->points;$feedback[]=['question_id'=>$q->id,'correct'=>$correct,'correct_answer'=>$q->correct_answer,'explanation'=>$q->explanation];}
        $percentage=$total?(int)round($score/$total*100):0;$passed=$percentage >= $quiz->passing_score;
        DB::table('quiz_attempts')->insert(['quiz_id'=>$id,'user_id'=>$request->user()->id,'answers'=>json_encode($data['answers']),'score'=>$score,'total'=>$total,'percentage'=>$percentage,'passed'=>$passed,'completed_at'=>now(),'created_at'=>now(),'updated_at'=>now()]);
        $this->activity($request->user()->id,'completed','quiz',$id,['score'=>$percentage]); return response()->json(compact('score','total','percentage','passed','feedback'),201);
    }

    public function contentItems(Request $request)
    {
        $kind=$request->validate(['kind'=>['required',Rule::in(['favorite','bookmark','wishlist'])]])['kind'];
        return DB::table('user_content_items')->where(['user_id'=>$request->user()->id,'kind'=>$kind])->latest()->get();
    }
    public function toggleContentItem(Request $request)
    {
        $d=$request->validate(['kind'=>['required',Rule::in(['favorite','bookmark','wishlist'])],'content_type'=>['required',Rule::in(['course','lesson','worksheet','workbook','quiz','bundle'])],'content_id'=>['required','integer','min:1']]);
        $key=$d+['user_id'=>$request->user()->id];$exists=DB::table('user_content_items')->where($key)->exists();
        $exists?DB::table('user_content_items')->where($key)->delete():DB::table('user_content_items')->insert($key+['created_at'=>now(),'updated_at'=>now()]); return ['active'=>!$exists];
    }

    public function recent(Request $request){return DB::table('activity_log')->where('user_id',$request->user()->id)->latest()->limit(20)->get();}

    public function search(Request $request)
    {
        $term=trim($request->validate(['q'=>['required','string','min:2','max:100']])['q']);$like='%'.$term.'%';$results=[];
        $results['courses']=DB::table('courses')->where('is_published',true)->where(fn($q)=>$q->where('title','like',$like)->orWhere('description','like',$like))->limit(8)->get(['id','title','description','grade_level']);
        $results['lessons']=DB::table('lessons')->join('courses','courses.id','=','lessons.course_id')->where('courses.is_published',true)->where('lessons.is_published',true)->where('lessons.title','like',$like)->limit(8)->get(['lessons.id','lessons.course_id','lessons.title','lessons.summary']);
        $results['worksheets']=DB::table('worksheets')->where('is_published',true)->where(fn($q)=>$q->where('title','like',$like)->orWhere('subject','like',$like))->limit(8)->get(['id','title','subject','grade_level']);
        $results['workbooks']=DB::table('workbooks')->where('is_published',true)->where('title','like',$like)->limit(8)->get(['id','title','subject','grade_level']);
        $results['activities']=DB::table('quizzes')->where('is_published',true)->where('title','like',$like)->limit(8)->get(['id','title','subject','grade_level']);
        if($request->user()->hasRole('admin','teacher')){$results['classes']=DB::table('classes')->where('name','like',$like)->limit(8)->get(['id','name','code','grade_level']);}
        if($request->user()->hasRole('admin')){$results['users']=DB::table('users')->where(fn($q)=>$q->where('name','like',$like)->orWhere('email','like',$like))->limit(8)->get(['id','name','email','role','status']);}
        return $results;
    }

    public function messages(Request $request)
    {
        return DirectMessage::with(['sender:id,name,role','recipient:id,name,role'])->where(fn($q)=>$q->where('sender_id',$request->user()->id)->orWhere('recipient_id',$request->user()->id))->latest()->paginate(30);
    }
    public function sendMessage(Request $request)
    {
        $d=$request->validate(['recipient_id'=>['required','integer','exists:users,id','different:sender_id'],'subject'=>['nullable','string','max:255'],'body'=>['required','string','max:5000']]);
        $recipient=User::findOrFail($d['recipient_id']); abort_unless($this->canMessage($request->user(),$recipient),403,'You may only message people connected to your classes or learning relationship.');
        return response()->json(DirectMessage::create($d+['sender_id'=>$request->user()->id])->load('recipient:id,name,role'),201);
    }
    public function readMessage(Request $request, DirectMessage $message){abort_unless($message->recipient_id===$request->user()->id,403);$message->update(['read_at'=>now()]);return $message;}

    public function calendar(Request $request)
    {
        $classIds=$this->classIds($request->user()); return DB::table('calendar_events')->where(fn($q)=>$q->whereNull('class_id')->orWhereIn('class_id',$classIds))->orderBy('starts_at')->get();
    }
    public function storeCalendarEvent(Request $request){abort_unless($request->user()->hasRole('admin','teacher'),403);$d=$request->validate(['title'=>['required','string','max:255'],'description'=>['nullable','string'],'class_id'=>['nullable','exists:classes,id'],'event_type'=>['required',Rule::in(['class','assignment','deadline','event'])],'starts_at'=>['required','date'],'ends_at'=>['nullable','date','after_or_equal:starts_at']]);if($request->user()->hasRole('teacher')&&isset($d['class_id']))abort_unless(in_array((int)$d['class_id'],$this->classIds($request->user()),true),403);$id=DB::table('calendar_events')->insertGetId($d+['created_by'=>$request->user()->id,'created_at'=>now(),'updated_at'=>now()]);return response()->json(DB::table('calendar_events')->find($id),201);}
    public function notifications(Request $request){return $request->user()->notifications()->latest()->paginate(30);}
    public function readNotification(Request $request,string $id){$n=$request->user()->notifications()->findOrFail($id);$n->markAsRead();return $n;}
    public function certificates(Request $request){return DB::table('certificates')->join('courses','courses.id','=','certificates.course_id')->where('user_id',$request->user()->id)->latest('issued_at')->get(['certificates.*','courses.title as course_title']);}

    public function users(Request $request){$this->admin($request);return User::with('roles:id,name,slug')->when($request->q,fn($q,$v)=>$q->where(fn($s)=>$s->where('name','like','%'.$v.'%')->orWhere('email','like','%'.$v.'%')))->when($request->role,fn($q,$v)=>$q->where('role',$v))->paginate(20);}
    public function updateUser(Request $request, User $user){$this->admin($request);abort_if($user->is($request->user())&&($request->input('status')==='suspended'||($request->filled('role')&&$request->role!=='admin')),422,'You cannot remove your own active admin access.');$d=$request->validate(['role'=>['sometimes',Rule::in(['admin','teacher','parent','student'])],'status'=>['sometimes',Rule::in(['active','suspended'])]]);DB::transaction(function()use($request,$user,$d){$user->update($d);if(isset($d['role'])){$user->roles()->sync([]);$user->assignRole($d['role'],$request->user());match($d['role']){'teacher'=>TeacherProfile::firstOrCreate(['user_id'=>$user->id]),'parent'=>\App\Models\ParentProfile::firstOrCreate(['user_id'=>$user->id]),'student'=>StudentProfile::firstOrCreate(['user_id'=>$user->id]),default=>null};}});$user->tokens()->delete();return $user->fresh('roles');}

    public function classes(Request $request){abort_unless($request->user()->hasRole('admin','teacher'),403);$q=SchoolClass::with(['homeroomTeacher.user:id,name','students.user:id,name','subjects:id,name']);if($request->user()->hasRole('teacher')){$tid=$request->user()->teacherProfile?->id;$q->where(fn($x)=>$x->where('homeroom_teacher_id',$tid)->orWhereHas('teachers',fn($t)=>$t->whereKey($tid)));}return $q->paginate(20);}
    public function storeClass(Request $request){abort_unless($request->user()->hasRole('admin'),403);$d=$request->validate(['name'=>['required','string','max:100'],'code'=>['required','string','max:50','unique:classes'],'grade_level'=>['required','string','max:50'],'academic_year'=>['required','string','max:20'],'homeroom_teacher_id'=>['nullable','exists:teacher_profiles,id']]);return response()->json(SchoolClass::create($d),201);}
    public function subjects(Request $request){return Subject::orderBy('name')->get();}
    public function storeSubject(Request $request){$this->admin($request);$d=$request->validate(['name'=>['required','string','max:100'],'code'=>['required','string','max:50','unique:subjects'],'description'=>['nullable','string','max:2000']]);return response()->json(Subject::create($d),201);}
    public function assignStudent(Request $request, SchoolClass $class){$this->admin($request);$d=$request->validate(['student_id'=>['required','exists:student_profiles,id']]);StudentProfile::whereKey($d['student_id'])->update(['class_id'=>$class->id]);return response()->noContent();}

    public function billingPlans(){return DB::table('billing_plans')->where('is_active',true)->orderBy('price_cents')->get();}
    public function billingInterest(Request $request){$d=$request->validate(['billing_plan_id'=>['required','exists:billing_plans,id']]);$id=DB::table('billing_interests')->insertGetId($d+['user_id'=>$request->user()->id,'status'=>'pending_provider','created_at'=>now(),'updated_at'=>now()]);return response()->json(['id'=>$id,'status'=>'pending_provider','message'=>'Plan selected. Payment processing is not connected yet.'],201);}

    public function google(Request $request)
    {
        $credential=$request->validate(['credential'=>['required','string']])['credential'];$response=Http::timeout(8)->get('https://oauth2.googleapis.com/tokeninfo',['id_token'=>$credential]);
        if(!$response->successful())throw ValidationException::withMessages(['credential'=>['Google could not verify this sign-in.']]);$google=$response->json();
        if(($google['aud']??null)!==config('services.google.client_id')||($google['email_verified']??'false')!=='true')throw ValidationException::withMessages(['credential'=>['This Google credential is not valid for EduSphere.']]);
        $user=User::where('google_id',$google['sub'])->orWhere('email',$google['email'])->first();
        if($user&&$user->status==='suspended')abort(403,'This account is suspended.');
        if(!$user){$user=User::create(['name'=>$google['name']??$google['email'],'email'=>$google['email'],'google_id'=>$google['sub'],'avatar_url'=>$google['picture']??null,'password'=>Str::random(48),'role'=>'student','email_verified_at'=>now()]);StudentProfile::create(['user_id'=>$user->id]);}
        else{$user->forceFill(['google_id'=>$google['sub'],'avatar_url'=>$google['picture']??$user->avatar_url,'email_verified_at'=>$user->email_verified_at??now()])->save();}
        return ['token'=>$user->createToken('lms-google')->plainTextToken,'portal_path'=>$user->portalPath(),'user'=>$user->load('roles.permissions','studentProfile','teacherProfile','parentProfile')];
    }

    private function admin(Request $request):void{abort_unless($request->user()->hasRole('admin')&&$request->user()->hasPermission('users.manage'),403);}
    private function classIds(User $user):array{if($user->hasRole('admin'))return SchoolClass::pluck('id')->all();if($user->hasRole('teacher'))return $user->teacherProfile?->classes()->pluck('classes.id')->all()??[];if($user->hasRole('student'))return array_filter([$user->studentProfile?->class_id]);return $user->parentProfile?->students()->pluck('class_id')->filter()->all()??[];}
    private function canMessage(User $a,User $b):bool{if($a->hasRole('admin'))return true;if($a->hasRole('parent')&&$b->hasRole('student'))return $a->parentProfile?->students()->where('user_id',$b->id)->exists()??false;if($a->hasRole('student')&&$b->hasRole('parent'))return $a->studentProfile?->parent?->user_id===$b->id;$teacher=$a->hasRole('teacher')?$a:$b;$student=$a->hasRole('student')?$a:$b;if($teacher->hasRole('teacher')&&$student->hasRole('student'))return $teacher->teacherProfile?->students()->where('user_id',$student->id)->exists()??false;return false;}
    private function activity(int $user,string $action,string $type,int $id,array $metadata=[]):void{DB::table('activity_log')->insert(['user_id'=>$user,'action'=>$action,'content_type'=>$type,'content_id'=>$id,'metadata'=>$metadata?json_encode($metadata):null,'created_at'=>now(),'updated_at'=>now()]);}
}
