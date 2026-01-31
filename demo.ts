import {
  countInstances,
  customElement,
  logAccess,
  logContext,
  logField,
  logInstanceCreation,
  on,
  minLength,
  range,
  rangeValidation,
  required,
  timeMethod,
  validate,
  regex,
} from "./decorators";

@logInstanceCreation
@logContext
@countInstances
export class MyClass {
  //@logContext
  @logField
  sport = "football";

  #foo = 1;

  @required
  @minLength(3)
  accessor city = "";

  @regex("^[0-9]{5}$")
  accessor zip = "";

  // The "accessor" keyword create auto-accessors.
  // It is defined in the TC39 "Decorators" proposal
  // which is at stage 3 as of 12/23/2025.
  // See https://github.com/tc39/proposal-decorators#class-auto-accessors.
  //@logContext
  //@logAccess
  @range(0, 10)
  count = 0;
  //accessor count = 0;

  //@logContext
  get foo() {
    return this.#foo;
  }

  //@logContext
  set foo(value) {
    this.#foo = value;
  }

  //@logContext
  @timeMethod
  increment() {
    this.count++;
    //console.log("count =", this.count);
  }

  logCount() {
    console.log("MyClass.log: count =", this.count);
  }
}

let mc = new MyClass();
//mc.city = "St. Charles";
mc.count = 7;
mc.zip = "foo";
const { valid, errors } = validate(mc);
if (!valid) alert(errors.join("\n"));

mc.increment();
mc.increment();
mc.logCount();
mc = new MyClass();
mc = new MyClass();
console.log("MyClass.instanceCount =", (MyClass as any).instanceCount);

@countInstances
export class Dog {
  name = "";
  @rangeValidation(0, 20)
  accessor age = 0;
  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Creates a new Dog instance.
   *
   * @param {string} name - The name of the dog.
   */
  /*******  7e656dba-9355-4c72-98a4-d8bdfef55ce9  *******/
  constructor(name: string) {
    this.name = name;
  }
}
const comet = new Dog("Comet");
const dogs = [new Dog("Ramsay"), new Dog("Oscar"), comet, new Dog("Greta")];
console.log("dogs.length =", dogs.length);
console.log("Dog.instanceCount =", (Dog as any).instanceCount);
comet.age = 5;
//comet.age = 50;

@customElement("hello-world")
export class HelloWorld extends HTMLElement {
  connectedCallback() {
    this.innerHTML = "<p>Hello, World!</p>";
  }
}

@customElement("info-button")
export class InfoButton extends HTMLElement {
  #dialog: HTMLDialogElement | undefined;

  @on("click")
  handleClick(event: MouseEvent) {
    const button = event.target as HTMLButtonElement;
    if (button.id === "close") {
      this.#dialog?.close();
    } else {
      this.#dialog?.showModal();
    }
  }

  connectedCallback() {
    const label = this.getAttribute("label") || "Info";
    const text = this.textContent || "No information was provided.";
    this.innerHTML = `
      <button>${label}</button>
      <dialog>
        <p>${text}</p>
        <button id="close">Close</button>
      </dialog>
    `;
    this.#dialog = this.querySelector("dialog") as HTMLDialogElement;
  }
}

export class Secret {
  @logField
  code = "random";
}

const secret = new Secret();
console.log(`Secret code is ${secret.code}.`);
