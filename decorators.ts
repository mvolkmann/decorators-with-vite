// Ensure the metadata global Symbol exists before any classes are loaded.
if (typeof Symbol.metadata === "undefined") {
  (Symbol as any).metadata = Symbol("Symbol.metadata");
}

export function countInstances<T extends new (...args: any[]) => {}>(
  target: T,
  { kind }: ClassDecoratorContext<T>,
) {
  if (kind !== "class") {
    throw new Error("This decorator can only be applied to a class.");
  }
  return class extends target {
    private static _instanceCount = 0;

    constructor(...args: any[]) {
      super(...args);
      (this.constructor as any)._instanceCount++;
    }

    static get instanceCount() {
      return this._instanceCount;
    }
  };
}

// This is the decorator factory function from Lit.
export function customElement(name: string) {
  return (target: CustomElementConstructor, context: ClassDecoratorContext) => {
    if (context.kind !== "class") {
      throw new Error("This decorator can only be applied to a class.");
    }
    if (!(target.prototype instanceof HTMLElement)) {
      throw new Error(
        "This decorator can only be applied " +
          "to a class that extends HTMLElement.",
      );
    }
    context.addInitializer(() => {
      if (!customElements.get(name)) {
        customElements.define(name, target);
        console.log(`registered custom element ${name}`);
      }
    });
  };
}

export function logAccess(
  target: any,
  { kind, name }: ClassAccessorDecoratorContext,
) {
  if (kind !== "accessor") {
    throw new Error(
      "This decorator can only be applied to " +
        'a field with the "accessor" keyword.',
    );
  }
  const nameString = String(name); // name is a Symbol
  return {
    get() {
      const value = target.get.call(this);
      console.log(`Getting ${nameString} field value ${value}.`);
      return value;
    },
    set(value: unknown) {
      console.log(`Setting ${nameString} field to ${value}.`);
      target.set.call(this, value);
    },
  };
}

export function logContext(target: any, context: any) {
  console.log("===");
  console.log(context.name, "is a", target.constructor.name);
  console.log("context =", context);
}

export function logField<This, Value>(
  target: undefined, // always undefined in field decorators
  context: ClassFieldDecoratorContext<This, Value>,
) {
  if (context.kind !== "field") {
    throw new Error("This decorator can only be applied to a field.");
  }
  const name = String(context.name);
  return (initialValue: Value) => {
    console.log(`The initial value of the ${name} field is ${initialValue}.`);
    if (initialValue === "random") return String(Math.random()) as Value;
    return initialValue;
  };
}

// The generic type T captures the type of the class being decorated.
export function logInstanceCreation<T extends new (...args: any[]) => {}>(
  target: T,
  { kind, name }: ClassDecoratorContext<T>,
) {
  if (kind !== "class") {
    throw new Error("This decorator can only be applied to a class.");
  }
  const nameString = name ?? "anonymous class";
  return class extends target {
    constructor(...args: any[]) {
      super(...args);
      const time = new Date().toLocaleTimeString();
      console.log(`${nameString} instance created at ${time}.`);
    }
  };
}

export function on(eventName: string) {
  return function (
    method: (this: HTMLElement, ...args: any[]) => any,
    context: ClassMethodDecoratorContext,
  ) {
    if (context.kind !== "method") {
      throw new Error("This decorator can only be applied to a method.");
    }
    context.addInitializer(function () {
      const element = this as HTMLElement;
      element.addEventListener(eventName, (event: Event) => {
        method.call(element, event);
      });
    });
  };
}

export function rangeValidation(min: number, max: number) {
  return (target: any, context: ClassAccessorDecoratorContext) => {
    let value: number;
    return {
      get() {
        return value;
      },
      set(newValue: number) {
        if (newValue < min || newValue > max) {
          const name = String(context.name);
          throw new Error(
            `${name} ${newValue} is outside range ${min} to ${max}`,
          );
        }
        value = newValue;
      },
    };
  };
}

export function timeMethod<This, Return>(
  originalMethod: (this: This, ...args: any[]) => Return,
  { kind, name }: ClassMethodDecoratorContext,
) {
  if (kind !== "method") {
    throw new Error("This decorator can only be applied to a method.");
  }
  const nameString = String(name); // name is a Symbol

  return function (this: This, ...args: any[]): Return {
    console.time(nameString);
    const result = originalMethod.call(this, ...args);
    console.timeEnd(nameString);
    return result;
  };
}

type ValidationRule = {
  validate: (value: any) => boolean;
  message: string;
};

function accessorOrField(context: DecoratorContext) {
  const { kind } = context;
  if (kind !== "accessor" && kind !== "field") {
    throw new Error(
      "This decorator can only be applied to an accessor or field.",
    );
  }
}

function addValidationRule(context: DecoratorContext, rule: ValidationRule) {
  const { metadata } = context;
  console.log("decorators.ts addValidationRule: metadata =", metadata);
  // @ts-ignore
  let constraints: Record<string, ValidationRule[]> = metadata["constraints"];
  if (!constraints) {
    // @ts-ignore
    constraints = metadata.constraints = {};
  }
  const name = String(context.name);
  constraints[name] ??= [];
  constraints[name].push(rule);
}

export function minLength(len: number) {
  return (_target: unknown, context: DecoratorContext) => {
    accessorOrField(context);
    addValidationRule(context, {
      validate: (v) => typeof v === "string" && v.length >= len,
      message: `${String(context.name)} must be at least ${len} characters`,
    });
  };
}

export function range(min: number, max: number) {
  return (target: unknown, context: DecoratorContext) => {
    accessorOrField(context);
    const name = String(context.name);
    addValidationRule(context, {
      validate: (v) => min <= v && v <= max,
      message: `${name} must be between ${min} and ${max}`,
    });
  };
}

export function regex(pattern: string) {
  return (_target: unknown, context: DecoratorContext) => {
    accessorOrField(context);
    addValidationRule(context, {
      validate: (v) => new RegExp(pattern).test(v),
      message: `${String(context.name)} must match pattern ${pattern}`,
    });
  };
}

export function required(_target: unknown, context: DecoratorContext) {
  accessorOrField(context);
  addValidationRule(context, {
    validate: (v: unknown) => v !== undefined && v !== null && v !== "",
    message: `${String(context.name)} is required`,
  });
}

// Unlike the rangeValidation decorator factory,
// this approach performs validation on request
// rather than each time a field is set.
export function validate(instance: Record<string, any>) {
  const metadata = instance.constructor[Symbol.metadata] ?? {};
  const constraints = metadata["constraints"] ?? {};
  const errors: string[] = [];
  for (const [prop, rules] of Object.entries(constraints)) {
    const value = instance[prop];
    for (const rule of rules) {
      if (!rule.validate(value)) {
        errors.push(`${rule.message} (value is ${value})`);
      }
    }
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}
