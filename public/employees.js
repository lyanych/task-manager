document.addEventListener("DOMContentLoaded", () => {
    fetchEmployees();
    fetchPositions();
});

async function fetchEmployees() {
    try {
        const response = await fetch("/employees");
        const employees = await response.json();
        renderEmployees(employees);
    } catch (error) {
        console.error("Ошибка загрузки сотрудников:", error);
    }
}

async function fetchPositions() {
    try {
        const response = await fetch("/positions");
        const positions = await response.json();
        renderPositions(positions);
    } catch (error) {
        console.error("Ошибка загрузки должностей:", error);
    }
}

function renderEmployees(employees) {
    const tableBody = document.getElementById("employeesTableBody");
    tableBody.innerHTML = "";
    employees.forEach(emp => {
        const row = `<tr>
            <td>${emp.id}</td>
            <td>${emp.last_name} ${emp.first_name} ${emp.middle_name || ""}</td>
            <td>${emp.phone_number}</td>
            <td>${emp.position_name}</td>
            <td>
                <button onclick="deleteEmployee(${emp.id})">Удалить</button>
            </td>
        </tr>`;
        tableBody.innerHTML += row;
    });
}

function renderPositions(positions) {
    const select = document.getElementById("positionSelect");
    select.innerHTML = "<option value=''>Выберите должность</option>";
    positions.forEach(pos => {
        const option = `<option value="${pos.id}">${pos.name}</option>`;
        select.innerHTML += option;
    });
}

async function addEmployee(event) {
    event.preventDefault();
    const last_name = document.getElementById("lastName").value;
    const first_name = document.getElementById("firstName").value;
    const middle_name = document.getElementById("middleName").value;
    const phone_number = document.getElementById("phoneNumber").value;
    const birth_date = document.getElementById("birthDate").value;
    const password = document.getElementById("password").value;
    const position_id = document.getElementById("positionSelect").value;

    if (!last_name || !first_name || !phone_number || !birth_date || !password || !position_id) {
        alert("Заполните все обязательные поля!");
        return;
    }

    try {
        await fetch("/employees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ last_name, first_name, middle_name, phone_number, birth_date, password, position_id })
        });
        fetchEmployees();
        document.getElementById("employeeForm").reset();
    } catch (error) {
        console.error("Ошибка добавления сотрудника:", error);
    }
}

async function deleteEmployee(id) {
    try {
        await fetch(`/employees/${id}`, { method: "DELETE" });
        fetchEmployees();
    } catch (error) {
        console.error("Ошибка удаления сотрудника:", error);
    }
}

document.getElementById("employeeForm").addEventListener("submit", addEmployee);
