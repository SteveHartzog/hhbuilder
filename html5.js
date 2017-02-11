'use strict';

(function formWithHtml5() {
  function createOutputTable(cols) {
    function createHeaderRow(headers) {
      let header = document.createElement('thead');
      let row = document.createElement('tr');  
      for (var index in headers) {
        row.appendChild(createHeaderColumn(headers[index]));
      }
      header.appendChild(row);
      return header;

      function createHeaderColumn(value) {
        var col = document.createElement('th');
        col.textContent = value;
        return col;
      }
    }

    let table = document.createElement('table');
    table.appendChild(createHeaderRow(cols));
    table.className = "output";
    table.setAttribute('rules', 'all');
    return table;
  }

  function validateAge() {
    if (form['age'].validity.valueMissing) {
      form['age'].setCustomValidity('Age is required.');
      return false;
    }
    if (form['age'].validity.rangeUnderflow) {
      form['age'].setCustomValidity('Age must be greater than 0.');
      return false;
    }

    // All good
    form['age'].setCustomValidity('');
    return true;
  }

  function validateRelationship() {
    if (form['rel'].validity.valueMissing) {
      form['rel'].setCustomValidity('Relationship is required.');
      return false;
    }

    // All good
    form['rel'].setCustomValidity('');
    return true;
  }

  function validate() {
    if (validateAge() && validateRelationship()) {
      return true;
    }
    return false;
  }

  function setupValidation() {
    form['age'].setAttribute('type', 'number');
    form['age'].setAttribute('required', 'required');
    form['age'].setAttribute('min', '1');
    form['rel'].setAttribute('required', 'required');  
  }

  function resetForm() {
    form['age'].value = '';
    form['rel'].selectedIndex = 0;
    form['smoker'].checked = false;
  }

  function addPerson(person) {
    function createPersonRow(person) {
      function createColumn(value) {
        var col = document.createElement('td');
        col.textContent = value;
        return col;
      }

      function createRemoveButton() {
        var col = document.createElement('td');
        var btn = document.createElement('button');
        btn.innerHTML = 'Remove';
        btn.addEventListener('click', removePerson);
        col.appendChild(btn);   
        return col;
      }

      var row = document.createElement('tr');
      for(var prop in person) {
        row.appendChild(createColumn(person[prop]));
      }
      row.appendChild(createRemoveButton());
      return row;
    }

    // Save person & Update output
    household.push(person);
    output.appendChild(createPersonRow(person));
    output.style.display = 'block';
  }

  function removePerson(e) {
    var thisRow = this.parentNode.parentNode;

    // Remove person from data & display
    household.splice(thisRow.rowIndex-1, 1);
    output.removeChild(thisRow);

    // Hide output if empty
    if(household.length === 0) {
      output.style.display = 'none';
    }

    e.preventDefault();
    return false;
  }

  function addClick(e) {
    if (validate()) {
      var person = {
        age: form['age'].value,
        relationship: form['rel'].options[form['rel'].selectedIndex].value,
        smoker: form['smoker'].checked
      }
      addPerson(person);
      resetForm();
    }
    return true;
  }

  function onSubmit(e) {
    if (household.length > 0) {
      var debug = document.getElementsByClassName('debug')[0];
      debug.innerHTML = '';
      debug.innerHTML = JSON.stringify(household);
      debug.style.display = 'block';
      e.preventDefault();
    } else {
      alert('You must submit at least one item.');
    }
  }

  // Properties
  var household = [];
  var output, form, builder, addButton, submitButton;

  return {
    init: function() {
      // Add Styles
      var style = document.createElement('style');
      style.type = 'text/css';
      style.innerHTML = '\
        body { font-family: arial }\
        h1 { font-family: tahoma; }\
        table.output { border-spacing: 0; border: 1px solid black; table-layout: fixed; width: 300px; display: none; margin-bottom:20px; }\
        table.output thead { font-family: tahoma; }\
        table.output thead tr { background: black; color: white; text-align: left; }\
        table.output thead th, table.output td { padding: 5px; }\
        table.output tr > td { width: 20%; }\
        table.output tr > td:last-child { text-align: right; }\
        button.add { margin-top: 20px; }\
        input:invalid { box-shadow: 0 0 5px 1px red; }\
        input:focus:invalid { outline: none; }\
        .error { color: red; display: none; }\
        .error ul { margin-top: 0; }';
      document.getElementsByTagName('head')[0].appendChild(style);

      // Fill properties
      form = document.forms[0];
      builder = document.getElementsByClassName('builder')[0];
      addButton = document.getElementsByClassName('add')[0];
      submitButton = document.querySelectorAll('[type=submit]')[0];    

      setupValidation();
      
      addButton.addEventListener('click', addClick);
      // Disable normal submit (to overcome default validation in html5 scenario)
      submitButton.setAttribute('type', 'button');
      submitButton.addEventListener('click', onSubmit);

      // Output of Household
      output = createOutputTable(['Age', 'Relationship', 'Smoker', '']);
      builder.insertBefore(output, form);
    }
  };
})().init();