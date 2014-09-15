"use-strict";

const
    Person = require("./model").Person,
    Table = require('cli-table'),
    prmpt = require("prompt"),
    exit = require("./util/exit");

var people;

module.exports.init = function (model) {
    people = model;
    
    exit.init({
        exit: {actions: [model.saveSync.bind(model)]},
        sigint: {actions: [model.saveSync.bind(model), process.exit]}
    });
    
    model.on('loaded', function () {
        showMainMenu();
    });
    model.load();
}

function showMainMenu() {
    var properties = [
        {
          name: 'input', 
          validator: /^[1-9q]$/,
          message: 'Please select: (1) Show, (2) Add, (q) Quit',
          required: true
        }
    ];

    prmpt.start();

    prmpt.get(properties, function (err, result) {
        if (err) { return onErr(err); }
        switch(result.input) {
            case "1":
                showContacts();
                break;
            case "2":
                addContact();
                break;
            case "q":
                console.log('User elected to exit, shutting down...');
                process.exit(0);
                break;
        }
    });

};
module.exports.showMainMenu = showMainMenu;

function showContacts() {
    var tbl = createTable();
	var person;
	for (var i = 0; i < people.list.length; i++) {
	    person = people.list[i];
	    tbl.push([i+1, person.fullName(), person.email, person.telephone, person.gender, person.birthDate, person.birthPlace]);    
	}
    console.log(tbl.toString());
    showMainMenu();
};

function addContact() {
    console.log('Add a contact:')
    prmpt.get(['firstname', 
               'lastname', 
               'email', 
               'telephone', 
               'gender', 
               'birthDate', 
               'birthPlace'], function (err, input) {
        var person = new Person(input.firstname, 
                                input.lastname, 
                                input.email, 
                                input.telephone, 
                                input.gender, 
                                input.birthDate, 
                                input.birthPlace);
                                
                                
        console.log('You entered:');
        console.log(person);
        
        var properties = [
            {
              name: 'input', 
              validator: /^[yn]/,
              message: 'Is this ok?: (y/n)',
              required: true
            }
        ];
        
        prmpt.get(properties, function (err, result) {
            if (err) { return onErr(err); }
            switch(result.input) {
                case "y":
                    people.add(person);
                    console.log('%s was added to your contacts', person.fullName());
                    showMainMenu();
                    break;
                case "n":
                    console.log('% was not added to your contacts, try again', person.fullName());
                    showMainMenu();
                    break;
            }
        });
  });
};

function createTable () {
    var chars = {
        'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
        'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚',
        'bottom-right': '╝', 'left': '║', 'left-mid': '╟', 'mid': '─',
        'mid-mid': '┼', 'right': '║', 'right-mid': '╢', 'middle': '│'
    };
    
	return new Table({
		head: ['No.', 'Name', 'Email', 'Telephone', 'Gender', 'D.O.B.', 'Birth Place'],
		chars: chars
	});
};

function onErr(err) {
    console.log(err);
    return 1;
};