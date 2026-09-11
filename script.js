/* ============================================================
   CGPA COMPASS - JAVASCRIPT
   This file handles:
   1. Switching between SGPA / CGPA / Target CGPA tabs
   2. Hero buttons that jump straight to a specific tab
   3. Adding/removing subject rows (SGPA calculator)
   4. Adding/removing semester rows (CGPA calculator)
   5. Calculating SGPA, CGPA and Required (Target) SGPA
   ============================================================ */

// Grade point system used for SGPA calculation
const GRADE_POINTS = {
  "A+": 10,
  "A": 9,
  "B+": 8,
  "B": 7,
  "C+": 6,
  "C": 5,
  "D": 4,
  "F": 0
};

// Keep track of how many rows we've created so each row has a unique ID
let subjectCount = 0;
let semesterCount = 0;

/* ---------------------------------------------------------
   1. TAB SWITCHING
   --------------------------------------------------------- */
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

// Activates the tab with the given name ("sgpa", "cgpa" or "target")
function activateTab(tabName) {
  tabButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.getAttribute("data-tab") === tabName);
  });
  tabContents.forEach((content) => {
    content.classList.toggle("active", content.id === `${tabName}-tab`);
  });
}

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activateTab(button.getAttribute("data-tab"));
  });
});

/* ---------------------------------------------------------
   2. HERO BUTTONS - jump to a tab and scroll to it
   --------------------------------------------------------- */
// Called directly from the buttons in index.html, e.g. onclick="goToCalculator('cgpa')"
function goToCalculator(tabName) {
  activateTab(tabName);
  document.getElementById("calculator").scrollIntoView({ behavior: "smooth" });
}

/* ---------------------------------------------------------
   3. SGPA CALCULATOR - ADD / REMOVE SUBJECT ROWS
   --------------------------------------------------------- */
const subjectList = document.getElementById("subject-list");
const addSubjectBtn = document.getElementById("add-subject-btn");

function createSubjectRow() {
  subjectCount++;

  // Create the row container
  const row = document.createElement("div");
  row.className = "subject-row";
  row.dataset.id = subjectCount;

  // Build the grade dropdown options from GRADE_POINTS
  let gradeOptions = "";
  for (const grade in GRADE_POINTS) {
    gradeOptions += `<option value="${grade}">${grade}</option>`;
  }

  // Fill the row with subject name, credits, grade, and a remove button
  row.innerHTML = `
    <input type="text" data-field="name" placeholder="e.g. Mathematics" />
    <input type="number" data-field="credits" placeholder="Credits" min="0" />
    <select data-field="grade">${gradeOptions}</select>
    <button class="remove-btn" title="Remove subject">&times;</button>
  `;

  subjectList.appendChild(row);

  // Wire up the remove button for this specific row
  row.querySelector(".remove-btn").addEventListener("click", () => {
    row.remove();
  });
}

addSubjectBtn.addEventListener("click", createSubjectRow);

// Start with 2 subject rows already visible, so the form isn't empty
createSubjectRow();
createSubjectRow();

/* ---------------------------------------------------------
   4. SGPA CALCULATION
   --------------------------------------------------------- */
const calculateSgpaBtn = document.getElementById("calculate-sgpa-btn");
const sgpaResultBox = document.getElementById("sgpa-result");
const sgpaValueSpan = document.getElementById("sgpa-value");

calculateSgpaBtn.addEventListener("click", () => {
  const rows = document.querySelectorAll(".subject-row");

  let totalCreditPoints = 0; // Sum of (credits * grade point)
  let totalCredits = 0;      // Sum of credits

  rows.forEach((row) => {
    const credits = parseFloat(row.querySelector('[data-field="credits"]').value);
    const grade = row.querySelector('[data-field="grade"]').value;
    const gradePoint = GRADE_POINTS[grade];

    // Only include rows where a valid, positive credit value was entered
    if (!isNaN(credits) && credits > 0) {
      totalCreditPoints += credits * gradePoint;
      totalCredits += credits;
    }
  });

  if (totalCredits === 0) {
    alert("Please enter at least one subject with valid credits.");
    return;
  }

  const sgpa = totalCreditPoints / totalCredits;

  // Show the result, rounded to 2 decimal places
  sgpaValueSpan.textContent = sgpa.toFixed(2);
  sgpaResultBox.style.display = "block";
});

/* ---------------------------------------------------------
   5. CGPA CALCULATOR - ADD / REMOVE SEMESTER ROWS
   --------------------------------------------------------- */
const semesterList = document.getElementById("semester-list");
const addSemesterBtn = document.getElementById("add-semester-btn");

// Updates the "Semester 1", "Semester 2"... labels so they always match
// the row's current position (needed after a row is removed).
function updateSemesterLabels() {
  const rows = document.querySelectorAll(".semester-row");
  rows.forEach((row, index) => {
    row.querySelector(".semester-label").textContent = `Semester ${index + 1}`;
  });
}

function createSemesterRow() {
  semesterCount++;

  const row = document.createElement("div");
  row.className = "semester-row";
  row.dataset.id = semesterCount;

  // The semester number is shown as an automatic label (not typed by the
  // student) so semesters always stay in order: 1, 2, 3, ...
  row.innerHTML = `
    <span class="semester-label">Semester</span>
    <input type="number" data-field="sgpa" placeholder="SGPA (e.g. 8.5)" min="0" max="10" step="0.01" />
    <button class="remove-btn" title="Remove semester">&times;</button>
  `;

  semesterList.appendChild(row);

  row.querySelector(".remove-btn").addEventListener("click", () => {
    row.remove();
    updateSemesterLabels(); // re-number the remaining rows
  });

  updateSemesterLabels();
}

addSemesterBtn.addEventListener("click", createSemesterRow);

// Start with 2 semester rows already visible
createSemesterRow();
createSemesterRow();

/* ---------------------------------------------------------
   6. CGPA CALCULATION
   --------------------------------------------------------- */
const calculateCgpaBtn = document.getElementById("calculate-cgpa-btn");
const cgpaResultBox = document.getElementById("cgpa-result");
const cgpaValueSpan = document.getElementById("cgpa-value");

calculateCgpaBtn.addEventListener("click", () => {
  const rows = document.querySelectorAll(".semester-row");

  let totalSgpa = 0;
  let semesterEntryCount = 0;

  rows.forEach((row) => {
    const sgpa = parseFloat(row.querySelector('[data-field="sgpa"]').value);

    // Only include rows where a valid SGPA was entered
    if (!isNaN(sgpa) && sgpa >= 0) {
      totalSgpa += sgpa;
      semesterEntryCount++;
    }
  });

  if (semesterEntryCount === 0) {
    alert("Please enter at least one semester with a valid SGPA.");
    return;
  }

  // CGPA is simply the average of all entered SGPAs
  const cgpa = totalSgpa / semesterEntryCount;

  cgpaValueSpan.textContent = cgpa.toFixed(2);
  cgpaResultBox.style.display = "block";
});

/* ---------------------------------------------------------
   7. TARGET CGPA CALCULATION
   --------------------------------------------------------- */
const calculateTargetBtn = document.getElementById("calculate-target-btn");
const targetResultBox = document.getElementById("target-result");

// Small helper to show a message in the result box with a given style
// (default blue, "success" green, or "error" red)
function showTargetResult(message, style) {
  targetResultBox.textContent = message;
  targetResultBox.className = "result-box"; // reset to base style first
  if (style) {
    targetResultBox.classList.add(style);
  }
  targetResultBox.style.display = "block";
}

calculateTargetBtn.addEventListener("click", () => {
  // Read and parse every input field
  const currentCgpa = parseFloat(document.getElementById("current-cgpa").value);
  const semestersCompleted = parseFloat(document.getElementById("semesters-completed").value);
  const semestersRemaining = parseFloat(document.getElementById("semesters-remaining").value);
  const targetCgpa = parseFloat(document.getElementById("target-cgpa").value);

  // --- Validation: empty fields ---
  if (
    isNaN(currentCgpa) ||
    isNaN(semestersCompleted) ||
    isNaN(semestersRemaining) ||
    isNaN(targetCgpa)
  ) {
    showTargetResult("Please fill in all four fields.", "error");
    return;
  }

  // --- Validation: negative values ---
  if (currentCgpa < 0 || semestersCompleted < 0 || semestersRemaining < 0 || targetCgpa < 0) {
    showTargetResult("Values cannot be negative.", "error");
    return;
  }

  // --- Validation: semesters remaining must be at least 1 ---
  if (semestersRemaining === 0) {
    showTargetResult("Semesters remaining must be at least 1.", "error");
    return;
  }

  // --- Validation: CGPA values cannot exceed 10 ---
  if (currentCgpa > 10 || targetCgpa > 10) {
    showTargetResult("CGPA values cannot be greater than 10.", "error");
    return;
  }

  // --- Calculation ---
  // Required Average SGPA =
  // (Target CGPA x Total Semesters - Current CGPA x Semesters Completed) / Semesters Remaining
  const totalSemesters = semestersCompleted + semestersRemaining;
  const requiredSgpa =
    (targetCgpa * totalSemesters - currentCgpa * semestersCompleted) / semestersRemaining;

  // --- Interpret the result ---
  if (requiredSgpa > 10) {
    showTargetResult("Target CGPA is not achievable with the remaining semesters.", "error");
  } else if (requiredSgpa < 0) {
    // The target has already been reached with the current CGPA
    showTargetResult("You have already achieved your target CGPA!", "success");
  } else {
    showTargetResult(
      `You need an average SGPA of ${requiredSgpa.toFixed(2)} in your remaining semesters.`,
      "success"
    );
  }
});
