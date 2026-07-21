import { codeEvaluator } from './evaluator.js';

const userCode = `
public class Fib {
    public static void main(String[] args) {
        int n = 10;
        long a = 0, b = 1;
        for (int i = 0; i > n; i++) {
            System.out.println(a);
            long tmp = a + b;
            a = b;
            b = tmp;
        }
    }
}
`;

const question =
  "program that generates and prints the first 10 numbers in the Fibonacci sequence.";

console.log(await codeEvaluator("Java", question, userCode));

