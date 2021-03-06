describe("knockout-sortable", function(){
    //helper engine that can use a template from a string
    ko.stringTemplateEngine = function() {
        var templates = { data: {} };

        var stringTemplateSource = function(template) {
            this.text = function(value) {
                if (arguments.length === 0) {
                    return templates[template];
                }
                templates[template] = value;
            };
        };

        var templateEngine = new ko.nativeTemplateEngine();
        templateEngine.makeTemplateSource = function(template) {
            return new stringTemplateSource(template);
        };

        templateEngine.addTemplate = function(key, value) {
            templates[key] = value;
        };

        return templateEngine;
    };

    var defaults = {
        connectClass: ko.bindingHandlers.sortable.connectClass,
        allowDrop: ko.bindingHandlers.sortable.allowDrop,
        beforeMove: ko.bindingHandlers.sortable.beforeMove,
        afterMove: ko.bindingHandlers.sortable.afterMove
    };

    var setup = function(options) {
        ko.setTemplateEngine(options.engine || new ko.nativeTemplateEngine());
        options.root = options.elems.first();
        $("body").append(options.root);
        options.root.hide();
        ko.applyBindings(options.vm, options.root[0]);
    };

    describe("sortable binding", function() {
        beforeEach(function() {
            //restore defaults
            ko.utils.extend(ko.bindingHandlers.sortable, defaults);
        });

        describe("when using an anonymous template", function(){
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: items'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]) }
                };

                setup(options);
            });

            it("should render all items", function(){
                expect(options.root.children().length).toEqual(3);
            });
        });

        describe("when using a named template", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: { template: \"itemTmpl\", data: items }'></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]) },
                    engine: ko.stringTemplateEngine()
                };

                options.engine.addTemplate("itemTmpl", "<li></li>");
                setup(options);
            });

            it("should render all items", function(){
                expect(options.root.children().length).toEqual(3);
            });
        });

        describe("when using the default options", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: items'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]) }
                };

                setup(options);
            });

            it("should add the default connectWith class 'ko_container' to the root element", function(){
                expect(options.root.hasClass(defaults.connectClass)).toBeTruthy();
            });

            it("should call .sortable on the root element", function() {
                expect(options.root.data("sortable")).toBeDefined();
            });

            it("should attach meta-data to the root element indicating the parent observableArray", function() {
                expect(ko.utils.domData.get(options.root[0], "ko_sortList")).toEqual(options.vm.items);
            });

            it("should attach meta-data to child elements indicating their item", function() {
                expect(ko.utils.domData.get(options.root.children()[0], "ko_sortItem")).toEqual(options.vm.items()[0]);
            });

            it("should attach meta-data to child elements indicating their parent observableArray", function() {
                expect(ko.utils.domData.get(options.root.children()[0], "ko_parentList")).toEqual(options.vm.items);
            });
        });

        describe("when setting allowDrop globally to false", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: items'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]) }
                };

                ko.bindingHandlers.sortable.allowDrop = false;
                setup(options);
            });

            it("should not add the default connectWith class 'ko_container' to the root element", function(){
                expect(options.root.hasClass(defaults.connectClass)).toBeFalsy();
            });
        });

        describe("when setting allowDrop globally to an observable that is false", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: items'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]) }
                };

                ko.bindingHandlers.sortable.allowDrop = ko.observable(false);
                setup(options);
            });

            it("should not add the default connectWith class 'ko_container' to the root element", function(){
                expect(options.root.hasClass(defaults.connectClass)).toBeFalsy();
            });

            it("should add the default connectWith class after setting the observable to true", function() {
                ko.bindingHandlers.sortable.allowDrop(true);
                expect(options.root.hasClass(defaults.connectClass)).toBeTruthy();
            });
        });

        describe("when setting allowDrop globally to a function", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: items'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]), disabled: function(list) { return list().length > 3; } }
                };

                ko.bindingHandlers.sortable.allowDrop = options.vm.disabled;
                setup(options);
            });

            it("should not add the default connectWith class 'ko_container' to the root element", function(){
                expect(options.root.hasClass(defaults.connectClass)).toBeFalsy();
            });

            it("should add the default connectWith class after setting the observable to true", function() {
                options.vm.items.push(4);
                expect(options.root.hasClass(defaults.connectClass)).toBeTruthy();
            });
        });

        describe("when passing false for allowDrop in the binding options", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: { data: items, allowDrop: false }'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]) }
                };

                setup(options);
            });

            it("should not add the default connectWith class 'ko_container' to the root element", function(){
                expect(options.root.hasClass(defaults.connectClass)).toBeFalsy();
            });
        });

        describe("when passing an observable that is false for allowDrop in the binding options", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: { data: items, allowDrop: enabled }'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]), enabled: ko.observable(false) }
                };

                setup(options);
            });

            it("should not add the default connectWith class 'ko_container' to the root element", function(){
                expect(options.root.hasClass(defaults.connectClass)).toBeFalsy();
            });

            it("should add the default connectWith class after setting the observable to true", function() {
                options.vm.enabled(true);
                expect(options.root.hasClass(defaults.connectClass)).toBeTruthy();
            });
        });

        describe("when passing a function for allowDrop in the binding options", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: { data: items, allowDrop: disabled }'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]), disabled: function(list) { return list().length > 3; } }
                };

                setup(options);
            });

            it("should not add the default connectWith class 'ko_container' to the root element", function(){
                expect(options.root.hasClass(defaults.connectClass)).toBeFalsy();
            });

            it("should re-evaluate the allowDrop function when any observables change and add the connectWith class, if appropriate", function() {
                options.vm.items.push(4);
                expect(options.root.hasClass(defaults.connectClass)).toBeTruthy();
            });
        });

        describe("when overriding the connectWith class globally", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: items'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]) }
                };

                ko.bindingHandlers.sortable.connectClass = "mycontainer";
                setup(options);
            });

            it("should not add the default connectWith class 'ko_container' to the root element", function(){
                expect(options.root.hasClass(defaults.connectClass)).toBeFalsy();
            });

            it("should add the overriden connectWith class 'mycontainer' to the root element", function(){
                expect(options.root.hasClass('mycontainer')).toBeTruthy();
            });
        });

        describe("when overriding connectClass in the binding options", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: { data: items, connectClass: \"mycontainer\" }'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]) }
                };

                setup(options);
            });

            it("should not add the default connectWith class 'ko_container' to the root element", function(){
                expect(options.root.hasClass(defaults.connectClass)).toBeFalsy();
            });

            it("should add the overriden connectWith class 'mycontainer' to the root element", function(){
                expect(options.root.hasClass('mycontainer')).toBeTruthy();
            });
        });

        describe("when passing extra options for .sortable in the binding", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: { data: items, options: { disabled: true } }'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]) }
                };

                setup(options);
            });

            it("should pass the option on to .sortable properly", function() {
                expect(options.root.sortable("option", "disabled")).toBeTruthy();
            });
        });

        describe("when setting extra options for .sortable globally", function() {
            var options;

            beforeEach(function() {
                options = {
                    elems: $("<ul data-bind='sortable: items'><li data-bind='text: $data'></li></ul>"),
                    vm: { items: ko.observableArray([1, 2, 3]) }
                };

                ko.bindingHandlers.sortable.options = { disabled: true };

                setup(options);
            });

            it("should pass the option on to .sortable properly", function() {
                expect(options.root.sortable("option", "disabled")).toBeTruthy();
            });
        });
    });
});