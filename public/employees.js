document.addEventListener("DOMContentLoaded", () => {
    loadEmployees();
    loadPositions();
});

async function loadEmployees() {
    const response = await fetch("/employees");
    const employees = await response.json();
    const tableBody = document.getElementById("employeesTableBody");
    tableBody.innerHTML = "";
    employees.forEach(emp => {
        const row = `<tr>
            <td>${emp.id}</td>
            <td>${emp.last_name} ${emp.first_name} ${emp.middle_name || ''}</td>
            <td>${emp.phone_number}</td>
            <td>${emp.position_name}</td>
            <td>
                <button onclick="deleteEmployee(${emp.id})">Удалить</button>
            </td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

async function loadPositions() {
    const response = await fetch("/positions");
    const positions = await response.json();
    const select = document.getElementById("positionId");
    select.innerHTML = "";
    positions.forEach(pos => {
        const option = `<option value="${pos.id}">${pos.name}</option>`;
        select.innerHTML += option;
    });
}

function showAddEmployeeForm() {
    document.getElementById("employeeForm").style.display = "block";
}

function hideEmployeeForm() {
    document.getElementById("employeeForm").style.display = "none";
}

async function saveEmployee(event) {
    event.preventDefault();
    const employee = {
        last_name: document.getElementById("lastName").value,
        first_name: document.getElementById("firstName").value,
        middle_name: document.getElementById("middleName").value,
        phone_number: document.getElementById("phoneNumber").value,
        birth_date: document.getElementById("birthDate").value,
        password: document.getElementById("password").value,
        position_id: document.getElementById("positionId").value
    };
    await fetch("/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employee)
    });
    hideEmployeeForm();
    loadEmployees();
}

async function deleteEmployee(id) {
    await fetch(`/employees/${id}`, { method: "DELETE" });
    loadEmployees();
}