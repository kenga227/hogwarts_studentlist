"use strict";
const template = document.querySelector("#templt").content;
const link = "https://petlatkea.dk/2019/hogwartsdata/students.json";
const familylink = "https://petlatkea.dk/2019/hogwartsdata/families.json";

//const link = "temp/students.json";
//const familylink = "temp/families.json";

const parent = document.querySelector("ul.full-list");
const modal = document.querySelector(".bg-modal");
const modalbg = document.querySelector(".modal-content");
const dropdown = document.querySelector("select");
let primaryData = [];
let usableData = [];
let expelledData = [];
let filteredData = [];

let prefectCounter = {
  Gryffindor: 0,
  Slytherin: 0,
  Hufflepuff: 0,
  Ravenclaw: 0
};

const newStudent = {
  firstname: "",
  lastname: "",
  nickname: "",
  middlename: "",
  gender: "",
  prefect: "",
  blood: "",
  inquisitorial: "",
  expelled: ""
};

window.addEventListener("DOMContentLoaded", init(link));
dropdown.addEventListener("change", filterOut);
document.querySelector("#fname").addEventListener("click", sortFirst);
document.querySelector("#lname").addEventListener("click", sortLast);
document.querySelector("#reverse").addEventListener("click", reverseArr);
document.querySelector("#expellButton").addEventListener("click", expell);
document.querySelector("#prefectButton").addEventListener("click", prefect);
document
  .querySelector("#prefectRevokeButton")
  .addEventListener("click", removePrefect);
document
  .querySelector("#inquisitorialButton")
  .addEventListener("click", inquisitorialize);
document
  .querySelector("#inquisitorialRevokeButton")
  .addEventListener("click", deInquisitorialize);

document.addEventListener("click", function(e) {
  if (e.target.nodeName == "LI") {
    openModal(e.target.getAttribute("id"));
  }
});

document.querySelector("#close").addEventListener("click", function() {
  modal.classList.add("hide");
});

function init(link) {
  fetch(link)
    .then(e => e.json())
    .then(data => {
      primaryData = data;
      fixData(data);
      injectMyself();
      displayData(filteredData);
    });

  fetch(familylink)
    .then(e => e.json())
    .then(data => {
      defineblood(data);
    });
}

function fixData(students) {
  students.forEach(studentJson => {
    const student = Object.create(newStudent);

    let endOfFirstName = studentJson.fullname.trim().indexOf(" ");
    student.firstname = capitalize(studentJson.house.trim());
    if (endOfFirstName > 0) {
      student.firstname = capitalize(
        studentJson.fullname.trim().substring(0, endOfFirstName)
      );
      if ((studentJson.fullname.trim().match(/ /g) || []).length == 2) {
        if (studentJson.fullname.trim()[endOfFirstName + 1] == '"') {
          student.nickname = studentJson.fullname
            .trim()
            .substring(
              studentJson.fullname.trim().indexOf('"') + 1,
              studentJson.fullname.trim().lastIndexOf('"')
            );
          student.lastname = studentJson.fullname
            .trim()
            .substring(
              studentJson.fullname.trim().lastIndexOf(" ") + 1,
              studentJson.fullname.trim().length
            );
        } else {
          student.middlename = capitalize(
            studentJson.fullname
              .trim()
              .substring(
                studentJson.fullname.trim().indexOf(" ") + 1,
                studentJson.fullname.trim().lastIndexOf(" ")
              )
          );
          student.lastname = capitalize(
            studentJson.fullname
              .trim()
              .substring(
                studentJson.fullname.trim().lastIndexOf(" ") + 1,
                studentJson.fullname.trim().length
              )
          );
        }
      } else {
        student.middlename = false;
        student.nickname = false;
        student.lastname = capitalize(
          studentJson.fullname
            .trim()
            .substring(
              studentJson.fullname.trim().indexOf(" ") + 1,
              studentJson.fullname.trim().length
            )
        );
      }
    } else {
      student.firstname = capitalize(studentJson.fullname.trim());
      student.lastname = "~Unknown~";
      student.nickname = false;
      student.middlename = false;
    }
    student.house = capitalize(studentJson.house.trim());
    student.gender = studentJson.gender;
    usableData.push(student);
  });
  filteredData = usableData;
}

function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

function displayData(students) {
  parent.innerHTML = "";
  console.log(students);
  if (students.length == 1) {
    document.querySelector(".listnaming").textContent =
      "Showing " + students.length + " student";
  } else {
    document.querySelector(".listnaming").textContent =
      "Showing " + students.length + " students";
  }
  students.forEach(student => {
    let clone = template.cloneNode(true);

    clone.querySelector(".first-name").textContent = student.firstname;
    if (student.lastname) {
      clone.querySelector(".last-name").textContent = student.lastname;
    } else {
      clone.querySelector(".last-name").textContent = "~Unknown~";
    }
    clone.querySelector(".house").textContent = student.house;

    clone.querySelector("li").setAttribute("id", student.firstname);

    parent.appendChild(clone);
  });
}

function openModal(studentName) {
  let filteredStudent = filteredData.filter(
    studentObject => studentObject.firstname === studentName
  )[0];

  document.querySelector("h5.expelled").classList.add("hide");
  document.querySelector("#prefectButton").disabled = false;
  document
    .querySelector("#expellButton")
    .setAttribute("value", filteredStudent.firstname);
  document
    .querySelector("#prefectButton")
    .setAttribute("value", filteredStudent.firstname);
  document
    .querySelector("#prefectRevokeButton")
    .setAttribute("value", filteredStudent.firstname);
  document
    .querySelector("#inquisitorialButton")
    .setAttribute("value", filteredStudent.firstname);

  document.querySelector("#inquisitorialButton").disabled = true;

  document
    .querySelector("#inquisitorialRevokeButton")
    .setAttribute("value", filteredStudent.firstname);

  modal.querySelector(".name").textContent =
    "First Name: " + filteredStudent.firstname;

  if (filteredStudent.middlename) {
    modal.querySelector(".middlename").textContent =
      "Middle Name: " + filteredStudent.middlename;
  } else {
    modal.querySelector(".middlename").textContent = "Middle Name: -";
  }

  if (filteredStudent.nickname) {
    modal.querySelector(".nickname").textContent =
      "Nickname: " + filteredStudent.nickname;
  } else {
    modal.querySelector(".nickname").textContent = "Nickname: -";
  }

  if (filteredStudent.lastname) {
    modal.querySelector(".lastname").textContent =
      "Last Name: " + filteredStudent.lastname;
  } else {
    modal.querySelector(".lastname").textContent = "Last Name: -";
  }

  modal.querySelector(".house").textContent = "House: " + filteredStudent.house;

  if (filteredStudent.house == "Slytherin") {
    document.querySelector(".wrap-crest > img").src = "images/Slytherin.png";
    modalbg.style.backgroundColor = "#00613E";
    modalbg.style.color = "white";
  } else if (filteredStudent.house == "Gryffindor") {
    document.querySelector(".wrap-crest > img").src = "images/Gryffindor.png";
    modalbg.style.backgroundColor = "#730001";
    modalbg.style.color = "white";
  } else if (filteredStudent.house == "Hufflepuff") {
    document.querySelector(".wrap-crest > img").src = "images/Hufflepuff.png";
    modalbg.style.backgroundColor = "#ECB939";
    modalbg.style.color = "white";
  } else if (filteredStudent.house == "Ravenclaw") {
    document.querySelector(".wrap-crest > img").src = "images/Ravenclaw.png";
    modalbg.style.backgroundColor = "#0F193F";
    modalbg.style.color = "white";
  }

  if (filteredStudent.lastname.indexOf("-") > 0) {
    modal.querySelector(".wrap-profile > img").src =
      "images/" +
      filteredStudent.lastname.substring(
        filteredStudent.lastname.indexOf("-") + 1,
        filteredStudent.lastname.length
      ) +
      "_" +
      filteredStudent.firstname.charAt(0).toLowerCase() +
      ".png";
    modal.querySelector(".wrap-profile > img").classList.remove("hide");
  } else if (filteredStudent.lastname == "Patil") {
    modal.querySelector(".wrap-profile > img").src =
      "images/" +
      filteredStudent.lastname.toLowerCase() +
      "_" +
      filteredStudent.firstname.toLowerCase() +
      ".png";
    modal.querySelector(".wrap-profile > img").classList.remove("hide");
  } else if (filteredStudent.lastname == "~Unknown~") {
    modal.querySelector(".wrap-profile > img").classList.add("hide");
  } else {
    modal.querySelector(".wrap-profile > img").src =
      "images/" +
      filteredStudent.lastname.toLowerCase() +
      "_" +
      filteredStudent.firstname.charAt(0).toLowerCase() +
      ".png";
    modal.querySelector(".wrap-profile > img").classList.remove("hide");
  }

  if (filteredStudent.prefect) {
    document.querySelector("h3.prefected").textContent =
      "Prefect of " + filteredStudent.house + " house";
    document.querySelector("#prefectButton").classList.add("hide");
    document.querySelector("#prefectRevokeButton").classList.remove("hide");
  } else {
    document.querySelector("h3.prefected").textContent = "";
    document.querySelector("#prefectButton").classList.remove("hide");
    document.querySelector("#prefectRevokeButton").classList.add("hide");
  }

  if (prefectCounter.Slytherin >= 2) {
    document.querySelector("#prefectButton").disabled = true;
  } else if (prefectCounter.Gryffindor >= 2) {
    document.querySelector("#prefectButton").disabled = true;
  } else if (prefectCounter.Ravenclaw >= 2) {
    document.querySelector("#prefectButton").disabled = true;
  } else if (prefectCounter.Hufflepuff >= 2) {
    document.querySelector("#prefectButton").disabled = true;
  }

  if (filteredStudent.blood == "pure") {
    document.querySelector(".blood-status").textContent = "Blood-Status: Pure";
  } else if (filteredStudent.blood == "half") {
    document.querySelector(".blood-status").textContent = "Blood-Status: Half";
  } else {
    document.querySelector(".blood-status").textContent =
      "Blood-Status: Unknown";
  }

  if (filteredStudent.blood == "pure") {
    document.querySelector("#inquisitorialButton").disabled = false;
  } else if (filteredStudent.house == "Slytherin") {
    document.querySelector("#inquisitorialButton").disabled = false;
  }

  if (filteredStudent.inquisitorial == true) {
    document.querySelector("h3.inquisitorial").textContent =
      "Member of Inquistorial Squad";
    document.querySelector("#inquisitorialButton").classList.add("hide");
    document
      .querySelector("#inquisitorialRevokeButton")
      .classList.remove("hide");
  } else {
    document.querySelector("h3.inquisitorial").textContent = "";
    document.querySelector("#inquisitorialButton").classList.remove("hide");
    document.querySelector("#inquisitorialRevokeButton").classList.add("hide");
  }

  if (filteredStudent.expelled) {
    document.querySelector("#expellButton").disabled = true;
    document.querySelector("#prefectButton").disabled = true;
    document.querySelector("h5.expelled").classList.remove("hide");
    document.querySelector("#inquisitorialButton").disabled = true;
  } else {
    document.querySelector("#expellButton").disabled = false;
  }

  changeBlood(filteredStudent.firstname);
  modal.classList.remove("hide");
}

function filterOut() {
  if (dropdown.value == "All") {
    filteredData = usableData;
    displayData(filteredData);
  } else if (dropdown.value == "Expelled") {
    filteredData = usableData.filter(
      studentObject => studentObject.expelled === true
    );
    filteredData = expelledData;
    displayData(filteredData);
  } else {
    filteredData = usableData.filter(
      studentObject => studentObject.house === dropdown.value
    );
    displayData(filteredData);
  }
  document.querySelector("#reverse").disabled = true;
}

function sortFirst() {
  filteredData = filteredData.sort(function(a, b) {
    return a.firstname.localeCompare(b.firstname);
  });
  displayData(filteredData);
  document.querySelector("#reverse").disabled = false;
}

function sortLast() {
  filteredData = filteredData.sort(function(a, b) {
    return a.lastname.localeCompare(b.lastname);
  });
  displayData(filteredData);
  document.querySelector("#reverse").disabled = false;
}

function reverseArr() {
  filteredData = filteredData.reverse();
  displayData(filteredData);
}

function expell() {
  for (let counter = 0; counter < usableData.length; counter++) {
    if (usableData[counter].firstname === "Agne") {
    } else if (usableData[counter].firstname === event.target.value) {
      usableData[counter].expelled = true;
      usableData[counter].prefect = false;
      usableData[counter].inquisitorial = false;
      expelledData.push(usableData[counter]);
      usableData.splice(counter, 1);
      filteredData = usableData;
    }
  }
  if (event.target.value === "Agne") {
    alert("Try Again");
  } else {
    document.querySelector("h3.prefected").textContent = "";
    document.querySelector("h3.inquisitorial").textContent = "";
    document.querySelector("#optionExpelled").classList.remove("hide");
    document.querySelector("#expellButton").disabled = true;
    document.querySelector("#prefectButton").disabled = true;
    document.querySelector("#inquisitorialButton").disabled = true;
    document.querySelector("h5.expelled").classList.remove("hide");
    modal.classList.add("hide");
    displayData(filteredData);
  }
}

function prefect() {
  for (let counter = 0; counter < usableData.length; counter++) {
    if (usableData[counter].firstname === event.target.value) {
      usableData[counter].prefect = true;
      filteredData = usableData;

      document.querySelector("h3.prefected").textContent =
        "Prefect of " + usableData[counter].house + " house";

      if (usableData[counter].house == "Slytherin") {
        prefectCounter.Slytherin++;
      } else if (usableData[counter].house == "Gryffindor") {
        prefectCounter.Gryffindor++;
      } else if (usableData[counter].house == "Hufflepuff") {
        prefectCounter.Hufflepuff++;
      } else if (usableData[counter].house == "Ravenclaw") {
        prefectCounter.Ravenclaw++;
      }
    }
  }
  document.querySelector("#prefectButton").classList.add("hide");
  document.querySelector("#prefectRevokeButton").classList.remove("hide");
}

function removePrefect() {
  for (let counter = 0; counter < usableData.length; counter++) {
    if (usableData[counter].firstname === event.target.value) {
      usableData[counter].prefect = false;
      filteredData = usableData;

      document.querySelector("h3.prefected").textContent = "";

      if (usableData[counter].house == "Slytherin") {
        prefectCounter.Slytherin--;
      } else if (usableData[counter].house == "Gryffindor") {
        prefectCounter.Gryffindor--;
      } else if (usableData[counter].house == "Hufflepuff") {
        prefectCounter.Hufflepuff--;
      } else if (usableData[counter].house == "Ravenclaw") {
        prefectCounter.Ravenclaw--;
      }
    }
  }
  document.querySelector("#prefectButton").classList.remove("hide");
  document.querySelector("#prefectRevokeButton").classList.add("hide");
}

function defineblood(BloodTypes) {
  for (let [key, value] of Object.entries(BloodTypes)) {
    for (let i = 0; i < value.length; i++) {
      for (let j = 0; j < usableData.length; j++) {
        const lastname = usableData[j].lastname;
        if (usableData[j].lastname === value[i]) {
          usableData[j].blood = key;
        }
      }
    }
  }
}

function inquisitorialize() {
  let secondaryCntr;
  for (let counter = 0; counter < usableData.length; counter++) {
    if (usableData[counter].firstname === event.target.value) {
      usableData[counter].inquisitorial = true;
      filteredData = usableData;
      secondaryCntr = counter;
    }
  }
  document.querySelector("h3.inquisitorial").textContent =
    "Member of Inquistorial Squad";
  document.querySelector("#inquisitorialButton").classList.add("hide");
  document.querySelector("#inquisitorialRevokeButton").classList.remove("hide");
  setTimeout(function() {
    usableData[secondaryCntr].inquisitorial = false;
    filteredData = usableData;
    document.querySelector("h3.inquisitorial").textContent = "";
    document.querySelector("#inquisitorialButton").classList.remove("hide");
    document.querySelector("#inquisitorialRevokeButton").classList.add("hide");
    alert("whoopsie");
  }, 3000);
}

function deInquisitorialize() {
  for (let counter = 0; counter < usableData.length; counter++) {
    if (usableData[counter].firstname === event.target.value) {
      usableData[counter].inquisitorial = false;
      filteredData = usableData;
    }
  }
  document.querySelector("h3.inquisitorial").textContent = "";
  document.querySelector("#inquisitorialButton").classList.remove("hide");
  document.querySelector("#inquisitorialRevokeButton").classList.add("hide");
}

function importMe() {
  let me = Object.create(newStudent);
  me.firstname = "Agne";
  me.lastname = "Krasauskaite";
  me.nickname = "Potter";
  me.house = "Ravenclaw";
  me.middlename = "Harry";

  usableData.push(me);
  filteredData = usableData;
}

function changeBlood(target) {
  for (let counter = 0; counter < usableData.length; counter++) {
    if (target == usableData[counter].firstname) {
      if (usableData[counter].blood == "half") {
        document.querySelector(".blood-status").textContent =
          "Blood-Status: Pure";
      } else if (usableData[counter].blood == "pure") {
        document.querySelector(".blood-status").textContent =
          "Blood-Status: Half";
      } else if (usableData[counter].blood == false) {
        document.querySelector(".blood-status").textContent =
          "Blood-Status: Pure";
      }
    }
  }
}
