'use strict';

(function householdBuilder() {
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

  function createErrorDiv(errors) {
    var div = document.createElement('div');
    div.className = "error";
    var validationHeader = document.createElement('h3');
    validationHeader.textContent = 'Errors:';  var div = document.createElement('div');
    div.className = "error";
    var validationHeader = document.createElement('h3');
    validationHeader.textContent = 'Errors:';
    div.appendChild(validationHeader).appendChild(errors);
    addButton.parentNode.insertBefore(div, addButton);
    return div;
  }

  function createErrorListItem(value) {
    var li = document.createElement('li');
    li.textContent = value;
    return li;
  }

  function isNumber(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  function validateAge() {
    if (isNaN(parseFloat(form['age'].value)) || form['age'].value < 1) {
      errors.add(errorTypes.ageIsNotANumber);
      updateErrorDiv();
      return false;
    } else {
      errors.remove(errorTypes.ageIsNotANumber);
      updateErrorDiv();
      return true;
    }
  }

  function validateAgeWithHtml5() {
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
    if (form['rel'].selectedIndex === 0) {
      errors.add(errorTypes.relIsRequired);
      updateErrorDiv();
      return false;
    } else {
      errors.remove(errorTypes.relIsRequired);
      updateErrorDiv();
      return true;
    }
  }

  function validateRelationshipWithHtml5() {
    if (form['rel'].validity.valueMissing) {
      form['rel'].setCustomValidity('Relationship is required.');
      return false;
    }

    // All good
    form['rel'].setCustomValidity('');
    return true;
  }

  function updateErrorDiv() {
    // clear all errors from errorDiv
    while (validationErrors.firstChild) {
      validationErrors.removeChild(validationErrors.firstChild);
    }

    // Show errors, if any
    if (errors.count() > 0) {
      var allErrors = errors.get();
      for (var error in allErrors) {
        validationErrors.appendChild(createErrorListItem(allErrors[error]));
      }
      errorDiv.style.display = 'block';
    } else {
      errorDiv.style.display = 'none';
    }

  }

  function validate() {
    validateAge();
    validateRelationship();

    return validationErrors.children.length === 0;
  }

  function validateWithHtml5() {
    if (validateAgeWithHtml5() && validateRelationshipWithHtml5()) {
      return true;
    }

    return false;
  }

  function setValidationType() {
    isHtml5 = document.querySelector('#isHtml5').checked;
    if (isHtml5) {
      // Add HTML5 Validation    
      form['age'].setAttribute('type', 'number');
      form['age'].setAttribute('required', 'required');
      form['age'].setAttribute('min', '1');
      form['rel'].setAttribute('required', 'required');  

      // Disable normal submit (to overcome default validation in html5 scenario)   
      submitButton.setAttribute('type', 'button');
      submitButton.addEventListener('click', onSubmit);

      // Undo normal validation
      form['age'].removeEventListener('blur', validateAge);
      form['rel'].removeEventListener('change', validateRelationship);
      while (validationErrors.firstChild) {
        validationErrors.removeChild(validationErrors.firstChild);
      }
      if (errorDiv) {
        errorDiv.style.display = 'none';
      }
      form.removeEventListener('submit', onSubmit);
    } else {
      errorTypes = {
        ageIsNotANumber: 'Age must be a number, and > 0',
        relIsRequired: 'Relationship is required'
      }

      // Error Elements
      validationErrors = document.createElement('ul');
      errorDiv = createErrorDiv(validationErrors);

      // Error data
      errors = (function() {
        var currentErrors = [];

        function add(error) {
          // Add if not there
          if (this.currentErrors.indexOf(error) === -1) {
            this.currentErrors.push(error);
          }
        }

        function remove(error) {
          this.currentErrors.splice(this.currentErrors.indexOf(error), 1);
        }

        function get() {
          return this.currentErrors;
        }

        function count() {
          return this.currentErrors.length;
        }

        return {
          currentErrors, add, remove, get, count
        };
      })();

      // Validation listeners
      form['age'].addEventListener('blur', validateAge);
      form['rel'].addEventListener('change', validateRelationship);  
      form.addEventListener('submit', onSubmit);
      
      // Undo html5 validation
      form['age'].setAttribute('type', 'text');
      submitButton.removeEventListener('click', onSubmit);
    }
    console.log(`HTML5 Validation? ${isHtml5}`);    
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
    var isValid = isHtml5 ? validateWithHtml5() : validate();
    if (isValid) {
      var person = {
        age: form['age'].value,
        relationship: form['rel'].options[form['rel'].selectedIndex].value,
        smoker: form['smoker'].checked
      }
      addPerson(person);
      resetForm();
    }
    if (!isHtml5) { e.preventDefault(); }
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
  var isHtml5, validationErrors, errorDiv, errorTypes, errors;
  var output, form, builder, addButton, submitButton;

  return { 
    init: function init() {
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

      // Fill propeties
      form = document.forms[0];
      builder = document.getElementsByClassName('builder')[0];
      addButton = document.getElementsByClassName('add')[0];
      submitButton = document.querySelectorAll('[type=submit]')[0];    

      // Get Validation Type
      var checkbox = document.createElement('input');
      checkbox.setAttribute('type', 'checkbox');
      checkbox.setAttribute('id', 'isHtml5');
      checkbox.addEventListener('click', setValidationType);
      var label = document.createElement('label');
      label.textContent = 'Use HTML5 Validation?';
      label.appendChild(checkbox);
      builder.parentNode.insertBefore(label, builder);
      setValidationType(); // default to standard
      
      addButton.addEventListener('click', addClick);

      // Output of Household
      output = createOutputTable(['Age', 'Relationship', 'Smoker', '']);
      builder.insertBefore(output, form);
    }
  }
})().init();