# decorators-with-vite

This demonstrates the use of JavaScript standard (not legacy) decorators.

```ts
interface ClassDecoratorContext<
  T extends abstract new (...args: any[]) => any = abstract new (
    ...args: any[]
  ) => any
> {
  readonly kind: "class";

  /** The name of the class being decorated. */
  readonly name: string | undefined;

  /** Adds a callback to be invoked after the class definition is fully
   * initialized and any static side effects have occurred.
   */
  addInitializer(initializer: (this: T) => void): void;

  /** An object that can be used to read or write metadata associated
   * with the class.
   */
  readonly metadata: DecoratorMetadata;
}

interface ClassFieldDecoratorContext<This = unknown, Value = unknown> {
  readonly kind: "field";
  readonly name: string | symbol;
  readonly static: boolean;
  readonly private: boolean;

  /** An object that can be used to access the current value of the class element at runtime. */
  readonly access: {
    /**
     * Determines whether an object has a property with the same name as the decorated element.
     */
    has(object: This): boolean;

    /**
     * Gets the value of the field on the provided object.
     */
    get(object: This): Value;

    /**
     * Sets the value of the field on the provided object.
     */
    set(object: This, value: Value): void;
  };

  /**
   * Adds a callback to be invoked immediately after the field being decorated
   * is initialized (regardless if the field is `static` or not).
   */
  addInitializer(initializer: (this: This) => void): void;

  readonly metadata: DecoratorMetadata;
}

interface ClassMethodDecoratorContext<
    This = unknown,
    Value extends (this: This, ...args: any) => any = (this: This, ...args: any) => any,
> {
    readonly kind: "method";
    readonly name: string | symbol;
    readonly static: boolean;
    readonly private: boolean;

    /** An object that can be used to access the current value of the class element at runtime. */
    readonly access: {
        /**
         * Determines whether an object has a property with the same name as the decorated element.
         */
        has(object: This): boolean;
        /**
         * Gets the current value of the method from the provided object.
         *
         * @example
         * let fn = context.access.get(instance);
         */
        get(object: This): Value;
};

interface ClassGetterDecoratorContext<This = unknown, Value = unknown> {
  readonly kind: "getter";
  readonly name: string | symbol;
  readonly static: boolean;
  readonly private: boolean;

  /** An object that can be used to access the current value of the class element at runtime. */
  readonly access: {
    /**
     * Determines whether an object has a property with the same name as the decorated element.
     */
    has(object: This): boolean;
    /**
     * Invokes the getter on the provided object.
     *
     * @example
     * let value = context.access.get(instance);
     */
    get(object: This): Value;
  };

  /**
   * Adds a callback to be invoked either after static methods are defined but before
   * static initializers are run (when decorating a `static` element), or before instance
   * initializers are run (when decorating a non-`static` element).
   */
  addInitializer(initializer: (this: This) => void): void;

  readonly metadata: DecoratorMetadata;
}

interface ClassSetterDecoratorContext<This = unknown, Value = unknown> {
  readonly kind: "setter";
  readonly name: string | symbol;
  readonly static: boolean;
  readonly private: boolean;

  /** An object that can be used to access the current value of the class element at runtime. */
  readonly access: {
    /**
     * Determines whether an object has a property with the same name as the decorated element.
     */
    has(object: This): boolean;
    /**
     * Invokes the setter on the provided object.
     *
     * @example
     * context.access.set(instance, value);
     */
    set(object: This, value: Value): void;
  };

  /**
   * Adds a callback to be invoked either after static methods are defined but before
   * static initializers are run (when decorating a `static` element), or before instance
   * initializers are run (when decorating a non-`static` element).
   */
  addInitializer(initializer: (this: This) => void): void;

  readonly metadata: DecoratorMetadata;
}

interface ClassAccessorDecoratorContext<This = unknown, Value = unknown> {
  readonly kind: "accessor";
  readonly name: string | symbol;
  readonly static: boolean;
  readonly private: boolean;

  /** An object that can be used to access the current value of the class element at runtime. */
  readonly access: {
    /**
     * Determines whether an object has a property with the same name as the decorated element.
     */
    has(object: This): boolean;

    /**
     * Invokes the getter on the provided object.
     *
     * @example
     * let value = context.access.get(instance);
     */
    get(object: This): Value;

    /**
     * Invokes the setter on the provided object.
     *
     * @example
     * context.access.set(instance, value);
     */
    set(object: This, value: Value): void;
  };

  /**
   * Adds a callback to be invoked immediately after the auto `accessor` being
   * decorated is initialized (regardless if the `accessor` is `static` or not).
   */
  addInitializer(initializer: (this: This) => void): void;

  readonly metadata: DecoratorMetadata;
}
```
