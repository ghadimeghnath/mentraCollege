## 3.2 Admin Module & Academic Structure Management

### 3.2.1 Academic Year Management

- **FR-ADM-AY-1 (Academic Year Creation):** Admins shall be able to create academic years by providing a name, start date, and end date (e.g., `2026-2027`). Academic years shall be stored as independent records and shall not be hardcoded into the application.

- **FR-ADM-AY-2 (Current Academic Year):** The system shall allow an Admin to designate one academic year as the currently active academic year. The active academic year shall be used as the default context for student enrollment, subject allocation, faculty assignment, attendance, marks, and other academic operations.

- **FR-ADM-AY-3 (Academic Year History):** Historical academic year records shall remain preserved in the database. Changing the active academic year shall not overwrite or delete previous student enrollments, subject assignments, marks, attendance, or faculty allocations.

- **FR-ADM-AY-4 (Academic Year Update):** Admins shall be able to edit the name and date range of an academic year, provided that such changes do not invalidate existing academic records.

- **FR-ADM-AY-5 (Academic Year Deactivation):** Admins shall be able to deactivate an academic year instead of permanently deleting it. Historical data associated with an inactive academic year shall remain accessible according to role permissions.

---

### 3.2.2 Department / Programme Management

- **FR-ADM-DEP-1 (Dynamic Department Creation):** Admins shall be able to create academic departments/programmes dynamically without requiring changes to application source code or database schema. A department record shall include at minimum a department/programme name, optional code, status, and display order.

- **FR-ADM-DEP-2 (Department Examples):** The system shall support departments/programmes such as BCA, BVoc, BCom, MCom, BBA, and BBA (FS), while allowing the Admin to create additional departments/programmes in the future.

- **FR-ADM-DEP-3 (Department Update):** Admins shall be able to update department/programme details, including its name, code, display order, and active status.

- **FR-ADM-DEP-4 (Department Deletion):** Admins shall be able to delete a department/programme only when doing so does not violate existing relational dependencies. If academic levels, classes, students, subjects, or historical records are associated with the department, the system shall prevent unsafe deletion and require the Admin to deactivate the department instead.

- **FR-ADM-DEP-5 (Department Activation Status):** Departments/programmes shall support active and inactive states. Inactive departments shall remain available for historical data retrieval but shall not be selectable for new student enrollments, classes, or academic allocations unless reactivated.

- **FR-ADM-DEP-6 (No Hardcoded Academic Structure):** The application shall not contain department-specific conditional logic such as fixed assumptions that BCA has three years or MCom has two years. The complete academic structure shall be derived from database records configured by the Admin.

---

### 3.2.3 Academic Level / Year Management

- **FR-ADM-LVL-1 (Dynamic Academic Level Creation):** Admins shall be able to create academic levels under each department/programme. Academic levels may represent First Year, Second Year, Third Year, or other institution-defined academic stages.

- **FR-ADM-LVL-2 (Department-Specific Duration):** Each department/programme shall have its own independently configured academic levels. For example, BCA may contain First Year, Second Year, and Third Year, while MCom may contain only First Year and Second Year.

- **FR-ADM-LVL-3 (Custom Academic Structures):** The system shall not require all departments/programmes to have the same number of academic levels. This shall allow future programmes with different durations or structures to be configured without application changes.

- **FR-ADM-LVL-4 (Academic Level Ordering):** Admins shall be able to define the display order of academic levels within a department/programme to ensure that they are displayed in the correct academic sequence.

- **FR-ADM-LVL-5 (Academic Level Update):** Admins shall be able to edit the name, display order, and active status of an academic level.

- **FR-ADM-LVL-6 (Academic Level Deletion):** An academic level shall not be permanently deleted when classes, student enrollments, subjects, attendance, marks, or other academic records depend on it. The system shall instead support deactivation where required.

---

### 3.2.4 Division Management

- **FR-ADM-DIV-1 (Dynamic Division Creation):** Admins shall be able to create one or more divisions under each academic level. Division names shall not be hardcoded and may include A, B, C, D, or any other institution-defined value.

- **FR-ADM-DIV-2 (Variable Division Count):** Each academic level may contain a different number of divisions. For example, a BCA academic level may contain divisions A and B, while a BCom academic level may contain divisions A, B, C, and D.

- **FR-ADM-DIV-3 (Division Management):** Admins shall be able to add, update, reorder, activate, deactivate, and, where relationally safe, delete divisions.

- **FR-ADM-DIV-4 (Independent Academic Configuration):** Divisions shall be configured independently for each academic level. The system shall not assume that every year of a department/programme has the same number or names of divisions.

---

### 3.2.5 Class Management

- **FR-ADM-CLS-1 (Class Creation):** The system shall represent an academic class as a configured combination of Department/Programme, Academic Level, Division, and Academic Year.

- **FR-ADM-CLS-2 (Class Identification):** Each class shall have a human-readable display name generated or configured from its academic structure, such as `FY BCA A`, `SY BCA B`, or `TY BCom D`.

- **FR-ADM-CLS-3 (Academic Year Association):** Classes shall be associated with a specific academic year to preserve historical academic records.

- **FR-ADM-CLS-4 (Class Activation):** Admins shall be able to activate or deactivate classes. Inactive classes shall remain available for historical reporting but shall not be used for new academic operations unless reactivated.

- **FR-ADM-CLS-5 (Class Dependencies):** Students, subjects, faculty assignments, attendance records, marks, and future academic modules shall reference the configured class rather than relying on hardcoded department/year/division values.

---

## 3.3 Faculty Management

### 3.3.1 Faculty Creation

- **FR-ADM-FAC-1 (Manual Faculty Creation):** Admins shall be able to manually create faculty/teacher records through the Admin dashboard.

- **FR-ADM-FAC-2 (Faculty Information):** Each faculty record shall contain at minimum the following information:
  - Full Name
  - Email Address
  - Phone Number
  - Faculty/Employee ID
  - Faculty Initials
  - Account Status

- **FR-ADM-FAC-3 (Faculty User Account):** Creating a faculty record shall create or associate the corresponding authenticated user account and Teacher profile required for role-based access to the system.

- **FR-ADM-FAC-4 (Unique Faculty ID):** Each Faculty/Employee ID shall be unique within the system.

- **FR-ADM-FAC-5 (Unique Email Address):** Each faculty email address shall be unique and shall be used as the faculty member's authentication identity.

- **FR-ADM-FAC-6 (Faculty Initials):** The system may automatically suggest faculty initials based on the faculty member's name, but the Admin shall be able to manually edit or override the initials before saving the record.

- **FR-ADM-FAC-7 (Faculty Initial Uniqueness):** The system shall validate faculty initials according to the institution's configured uniqueness rules to prevent ambiguous faculty identification.

- **FR-ADM-FAC-8 (Faculty Update):** Admins shall be able to update faculty information, including name, phone number, faculty initials, and active status.

- **FR-ADM-FAC-9 (Faculty Deactivation):** Admins shall be able to deactivate faculty members without deleting their historical subject assignments, attendance activity, marks, feedback, or other academic records.

---

## 3.4 Student Management & Excel Import

### 3.4.1 Class-Wise Student Import

- **FR-ADM-STU-1 (Excel Upload):** Admins shall be able to upload student information through an Excel spreadsheet.

- **FR-ADM-STU-2 (Class Selection Before Import):** Before uploading or importing students, the Admin shall select the target Department/Programme, Academic Level, Division, and Academic Year.

- **FR-ADM-STU-3 (Excel Student Data):** The system shall support importing student information such as Roll Number, Student ID, Full Name, Email Address, Phone Number, and other institution-defined fields.

- **FR-ADM-STU-4 (File Validation):** The system shall validate the uploaded spreadsheet format and required columns before importing any student records.

- **FR-ADM-STU-5 (Row-Level Validation):** Each student row shall be independently validated for required fields, invalid data formats, duplicate identifiers, duplicate email addresses, and other data integrity constraints.

- **FR-ADM-STU-6 (Import Preview):** Before permanently saving the imported students, the system shall provide an import preview displaying the total number of rows, valid records, invalid records, duplicate records, and validation errors.

- **FR-ADM-STU-7 (Import Confirmation):** Student records shall only be inserted into the database after explicit confirmation by the Admin.

- **FR-ADM-STU-8 (Error Reporting):** The system shall identify invalid or rejected rows and provide sufficient error information for the Admin to correct the source spreadsheet.

- **FR-ADM-STU-9 (Transactional Import):** The final import operation shall be executed through controlled server-side database operations to ensure that student user accounts, student profiles, and class enrollments remain consistent.

---

### 3.4.2 Student Enrollment & Academic History

- **FR-ADM-STU-10 (Student Enrollment):** Each student shall be enrolled in a configured class for a specific academic year.

- **FR-ADM-STU-11 (Enrollment History):** Student enrollment shall be stored as historical records. Moving a student to a new class or academic year shall create a new enrollment record rather than overwriting the student's previous academic placement.

- **FR-ADM-STU-12 (Class-Wise Student Listing):** Admins shall be able to view and manage students by Academic Year, Department/Programme, Academic Level, and Division.

- **FR-ADM-STU-13 (Duplicate Prevention):** The system shall prevent duplicate student creation based on configured unique identifiers such as Student ID, institutional identifier, or email address.

- **FR-ADM-STU-14 (Student Status):** Student records shall support active and inactive states while preserving historical academic records.

---

## 3.5 Subject & Curriculum Management

### 3.5.1 Subject Creation

- **FR-ADM-SUB-1 (Subject Creation):** Admins shall be able to create subjects dynamically through the Admin dashboard.

- **FR-ADM-SUB-2 (Subject Information):** A subject record shall contain at minimum a Subject Name, optional Subject Code, optional Description, and Active Status.

- **FR-ADM-SUB-3 (Subject Reusability):** A subject shall exist independently from a specific class so that the same subject can be assigned to multiple classes when required.

- **FR-ADM-SUB-4 (Subject Update):** Admins shall be able to update subject information without affecting historical academic records where the subject has already been used.

- **FR-ADM-SUB-5 (Subject Deactivation):** Admins shall be able to deactivate a subject rather than permanently deleting it when historical records depend on it.

---

### 3.5.2 Class Subject Assignment

- **FR-ADM-SUB-6 (Class-Specific Subject Assignment):** Admins shall be able to assign one or more subjects to a specific class.

- **FR-ADM-SUB-7 (Academic Context):** Subject assignments shall be associated with the relevant class and academic year.

- **FR-ADM-SUB-8 (Dynamic Subject Configuration):** Admins shall be able to add or remove subjects from a class according to the curriculum for that academic level.

- **FR-ADM-SUB-9 (Department-Specific Curriculum):** Different departments/programmes and academic levels may contain different subject combinations. The application shall not hardcode subjects for any department or class.

For example, the Admin may configure:

```text
TY BVoc
├── Web Development
├── Cloud Computing
├── Artificial Intelligence
└── Internship
```

while another class may have an entirely different set of subjects.

---

## 3.6 Faculty Subject Assignment

- **FR-ADM-FSA-1 (Faculty Assignment):** Admins shall be able to assign one or more faculty members to each subject configured for a class.

- **FR-ADM-FSA-2 (Theory Responsibility):** While assigning a faculty member to a subject, the Admin shall be able to specify whether the faculty member is responsible for Theory.

- **FR-ADM-FSA-3 (Practical Responsibility):** While assigning a faculty member to a subject, the Admin shall be able to specify whether the faculty member is responsible for Practical work.

- **FR-ADM-FSA-4 (Both Theory and Practical):** The same faculty member may be assigned responsibility for both Theory and Practical components of a subject.

- **FR-ADM-FSA-5 (Checkbox-Based Assignment):** The faculty assignment interface shall provide independent checkbox controls for:
  - Handles Theory
  - Handles Practical

  At least one responsibility shall be selected before the assignment can be saved.

- **FR-ADM-FSA-6 (Multiple Faculty Support):** A subject may have multiple faculty assignments where permitted by the academic structure. For example, one faculty member may handle Theory while another handles Practical sessions.

- **FR-ADM-FSA-7 (Assignment Update):** Admins shall be able to update a faculty member's Theory and Practical responsibilities for a subject.

- **FR-ADM-FSA-8 (Assignment Deactivation):** Faculty-subject assignments shall support deactivation or removal without deleting historical marks, attendance, or academic activity associated with the assignment.

---

## 3.7 Academic Structure Relationship Model

The academic management architecture shall follow the following logical hierarchy:

```text
Academic Year
      │
      ▼
Department / Programme
      │
      ▼
Academic Level
      │
      ▼
Division
      │
      ▼
Class
      │
      ├───────────────┐
      ▼               ▼
Student Enrollment   Class Subjects
                      │
                      ▼
              Faculty Assignments
                      │
                      ▼
                    Faculty
```

The system shall maintain these relationships as independent database entities rather than storing department names, years, divisions, or faculty assignments as fixed application constants. This approach allows the institution to add new departments, modify programme durations, create additional divisions, update curricula, import new student batches, and modify faculty responsibilities without requiring changes to the application source code.
