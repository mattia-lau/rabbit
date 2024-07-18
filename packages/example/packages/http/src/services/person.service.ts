export class PersonService {
  get() {
    return { age: 1 };
  }

  getRandomNumber() {
    return Math.floor(Math.random() * 1000);
  }
}
