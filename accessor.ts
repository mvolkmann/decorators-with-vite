class Test {
  // This works in Deno, but not Bun.
  accessor x = 1;
}
console.log(new Test().x);
