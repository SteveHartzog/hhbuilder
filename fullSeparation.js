'use strict';

(function form() {
  function View() {
    function createHeaderColumn(value) {
      var col = document.createElement('th');
      col.textContent = value;
      return col;
    }

    function createHeaderRow(headers) {
      let header = document.createElement('thead');
      let row = document.createElement('tr');  
      for (var index in headers) {
        row.appendChild(createHeaderColumn(headers[index]));
      }
      header.appendChild(row);
      return header;
    }

    function createColumn(value) {
      var col = document.createElement('td');
      col.textContent = value;
      return col;
    }

    function createRemoveButton() {
      var col = document.createElement('td');
      var btn = document.createElement('button');
      btn.innerHTML = 'Remove';
      btn.addEventListener('click', function(e) {
        var thisRow = this.parentNode.parentNode;
        var person = {
          age: Number(thisRow.cells[0].textContent),
          relationship: thisRow.cells[1].textContent,
          smoker: thisRow.cells[2].textContent === 'true'
        }

        // Remove person from data & display
        hh.removePerson(person);

        // Hide output if empty
        if(hh.people.length === 0) {
          output.style.display = 'none';
        }

        e.preventDefault();
        return false;
      });

      col.appendChild(btn);   
      return col;
    }

    function createErrorDiv(beforeElement) {
      var div = document.createElement('div');
      div.className = "error";
      var validationHeader = document.createElement('h3');
      validationHeader.textContent = 'Errors:';  var div = document.createElement('div');
      div.className = "error";
      var validationHeader = document.createElement('h3');
      validationHeader.textContent = 'Errors:';
      div.appendChild(validationHeader).appendChild(validationErrors);
      beforeElement.parentNode.insertBefore(div, beforeElement);            
      return div;
    }

    function createOutputTable(cols) {
      let table = document.createElement('table');
      table.appendChild(createHeaderRow(cols));
      table.className = "output";
      table.setAttribute('rules', 'all');
      return table;
    }

    function createOutputRow(item) {
      var row = document.createElement('tr');
      for(var prop in item) {
        row.appendChild(createColumn(item[prop]));
      }
      row.appendChild(createRemoveButton());
      return row;
    }

    function createErrorListItem(error) {
      var li = document.createElement('li');
      li.textContent = error;
      return li;
    }

    function updateErrorDiv(errors) {
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

    var form = document.forms[0];
    var builder = document.getElementsByClassName('builder')[0];
    var addButton = document.getElementsByClassName('add')[0];
    var submitButton = document.querySelectorAll('[type=submit]')[0];
    var validationErrors = document.createElement('ul');
    var debugElement = document.querySelector('pre.debug');     
    var output = createOutputTable(['Age', 'Relationship', 'Smoker', '']);
    builder.insertBefore(output, form);
    var errorDiv = createErrorDiv(addButton);    

    // Wire up event listeners
    addButton.addEventListener('click', function(e) {
      var person = {
        age: form['age'].value,
        relationship: form['rel'].options[form['rel'].selectedIndex].value,
        smoker: form['smoker'].checked
      }
      if (hh.addPerson(person)) {
        // resetForm
        form['age'].value = '';
        form['rel'].selectedIndex = 0;
        form['smoker'].checked = false;
        errorDiv.style.display = 'none';
      } else {
        updateErrorDiv(hh.errors);        
      }
      e.preventDefault();
    });
    form['age'].addEventListener('blur', function(e) {
      hh.validateAge(form['age'].value);
      updateErrorDiv(hh.errors);
    });
    form['rel'].addEventListener('change', function(e) {
      hh.validateRelationship(form['rel'].value);
      updateErrorDiv(hh.errors);
    });  
    form.addEventListener('submit', function(e) {
      if (hh.people.length > 0) {
        debugElement.innerHTML = '';
        debugElement.innerHTML = JSON.stringify(hh.people);
        debugElement.style.display = 'block';
        e.preventDefault();
      } else {
        alert('You must submit at least one item.');
      }
    });
    output.addEventListener('personAdded', function(e) {
      var msg = e.detail.message;
      var people = e.detail.people;
      var person = e.detail.person;

      this.appendChild(createOutputRow(person));
      if (this.children.length > 1) {
        this.style.display = 'block';
      }
    });
    output.addEventListener('personRemoved', function(e) {
      var msg = e.detail.message;
      var person = e.detail.person;

      for(var i=0; i<this.rows.length;i++){
        if (i !== this.rows.length.toString()
          && this.rows[i].cells[0].textContent === person.age.toString()
          && this.rows[i].cells[1].textContent === person.relationship
          && this.rows[i].cells[2].textContent === person.smoker.toString()) {
            this.removeChild(this.rows[i]);
            break;
          }
      }

      // Hide output if empty
      if(this.rows.length < 1) {
        this.style.display = 'none';
      }

    });

    return {
      output: output
    }
  }

  function Household(domNotifications) {
    var people = null;
    var errorTypes = {
      ageIsNotANumber: 'Age must be a number, and > 0',
      relIsRequired: 'Relationship is required'
    };
    var errorList = (function() {
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
    var data = [];
    var notify = domNotifications;

    function validateAge(age) {
      if (isNaN(parseFloat(age)) || age < 1) {
        errorList.add(errorTypes.ageIsNotANumber);
        return false;
      } else {
        errorList.remove(errorTypes.ageIsNotANumber);
        return true;
      }
    }

    function validateRelationship(relationship) {
      if (relationship.length < 1) {
        errorList.add(errorTypes.relIsRequired);
        return false;
      } else {
        errorList.remove(errorTypes.relIsRequired);
        return true;
      }
    }

    // Public
    this.validateAge = validateAge;
    this.validateRelationship = validateRelationship;
    this.addPerson = function(person) {
      var isValid;
      var validAge = validateAge(person.age);
      var validRelationship = validateRelationship(person.relationship);
      if (validAge && validRelationship) {
        isValid = true;
      } else {
        isValid = false;
      }
      if (isValid) {
        data.push(person);
        notify.dispatchEvent(new CustomEvent(
            "personAdded",
            {
              detail: {
                message: `${JSON.stringify(person)} added successfully.`,
                person: person
              },
              bubbles: true,
              cancelable: true
            }
          )
        );
        return true;
      } else {
        return false;
      }
    };
    this.removePerson = function(person) {
      for (let index in data) {
        if (data[index].age === person.age
          && data[index].relationship === person.relationship
          && data[index].smoker === person.smoker) {
          data.splice(index, 1);
        }
      }

      notify.dispatchEvent(new CustomEvent(
          "personRemoved",
          {
            detail: {
              message: `${JSON.stringify(person)} removed successfully.`,
              person: person
            },
            bubbles: true,
            cancelable: true
          }
        )
      );
    }    
    Object.defineProperties(this, {
      'people': {
        get: function() { return data; },
        enumerable: true,
        configurable: false
      },
      'errors': {
        get: function() { return errorList; },
        enumerable: false,
        configurable: false
      }
    });
  }

  var view, hh;

  return {
    init: function () {
      // Init the View
      view = new View();

      // Create Data Structure and pass the element to notify on change
      hh = new Household(view.output);

      // Test Data
      hh.addPerson({ age: 17, relationship: 'child', smoker: false });
      hh.addPerson({ age: 70, relationship: 'parent', smoker: true });
      hh.addPerson({ age: 44, relationship: 'self', smoker: false });
      // hh.removePerson({ age: 70, relationship: 'parent', smoker: true });
    }
  };
})().init();