interface ProfileInterface {
  id: string;
  email: string;
  role: string;
}

type ProfileType = {
  id: string;
  email: string;
  role: string;
}

// Test: does interface satisfy Record<string, unknown>?
type Test1 = ProfileInterface extends Record<string, unknown> ? 'yes' : 'no';  
type Test2 = ProfileType extends Record<string, unknown> ? 'yes' : 'no';

// Make them visible
const test1: Test1 = 'yes'; // Will this error?
const test2: Test2 = 'yes'; // Will this error?
