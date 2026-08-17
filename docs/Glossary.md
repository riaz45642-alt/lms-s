# Glossary

| Term | Simple meaning |
|---|---|
| API | A set of web addresses that lets the frontend ask the backend for data or actions. |
| Assignment | A worksheet connected to one student, with instructions and optional deadline. |
| Authentication | Checking who a user is, normally with email and password. |
| Authorization | Checking whether that user may see or change a specific item. |
| Backend | The server-side code that applies rules, uses the database, and handles files. |
| Bearer token | A secret login value sent with API requests. Anyone who has it may act as that user until it is removed or expires. |
| Build | The process that prepares source files for use in a browser or server. |
| Cache | Temporary saved data used to make an application faster. |
| Controller | Backend code that handles one type of API request. |
| CRUD | Create, Read, Update, and Delete: four common data actions. |
| Database | Organized storage for accounts, assignments, results, and other records. |
| Deployment | Putting the application on a server where users can access it. |
| Docker | A tool that packages an application and its runtime into containers. |
| Endpoint | One API method and URL, such as `POST /api/auth/login`. |
| Eloquent | Laravel's tool for working with database records as PHP objects. |
| Environment variable | A setting outside the source code, often stored locally in `.env`. |
| Foreign key | A database column that points to a record in another table. |
| Framework | Reusable code and rules that provide a foundation for an application. |
| Frontend | The pages, forms, and buttons users see in the browser. |
| Hash | A one-way protected form of a password. The original password is not stored. |
| HTTP method | The action word in a web request, such as GET, POST, PATCH, or DELETE. |
| JSON | A simple text format used to send structured API data. |
| Laravel | The PHP framework used for the EduSphere backend. |
| LMS | Learning Management System: software that organizes teaching and learning. |
| Middleware | A check that runs before an API action, such as confirming login or role. |
| Migration | A versioned instruction that creates or changes database tables. |
| Model | Code that represents a type of database record and its relationships. |
| Multipart form data | A request format used to upload a file together with text fields. |
| Nginx | The web server used by the supplied production container. |
| Pagination | Splitting a long result into pages. EduSphere API lists normally return 20 items per page. |
| PHP-FPM | The service that runs PHP code behind Nginx. |
| Policy | Central code that decides whether a user may act on a record. |
| PostgreSQL | The main relational database used by this project. |
| React | The JavaScript library used to build the browser interface. |
| Relationship | A connection between records, such as parent to student or teacher to student. |
| Report | The grade, progress percentage, and teacher comment created from a checked review. |
| Role | A user's broad account type: administrator, teacher, parent, or student. |
| Route | A rule connecting a URL to a page or backend action. |
| Sanctum | The Laravel package that creates and checks API access tokens. |
| Seeder | Code that adds prepared starting or demo data to a database. |
| Session | A period of interaction while a user is signed in. The browser may keep a token for one session. |
| Storage disk | A Laravel-configured location for files. This project uses private local storage by default. |
| Transaction | A group of database changes that all succeed together or are all cancelled. |
| Validation | Checking submitted values before saving them. |
| Vite | The tool that prepares and serves the React frontend during development and production builds. |
