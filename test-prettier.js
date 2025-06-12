// This file has intentional formatting issues to test the pre-commit hook
const obj = { name: 'test', value: 123, nested: { a: 1, b: 2 } };
function testFunction(param1, param2) {
  console.log('This line has double quotes instead of single quotes');
  return param1 + param2;
}
