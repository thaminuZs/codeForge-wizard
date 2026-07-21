import { runJavaCode } from './java-runner/java.runner.ts';
import { runCppCode } from './cpp-runner/cpp.runner.ts';
import { runJSCode } from './js-runner/js.runner.ts';

const javaCode = `
public class Fib {
    public static void main(String[] args) {
        int n = 10;
        long a = 0, b = 1;
        for (int i = 0; i < n; i++) {
            System.out.println(a);
            long tmp = a + b;
            a = b;
            b = tmp;
        }
        for (int i=0;;) { }
    }
}
`;

const res = runJavaCode('my_jre', 'fib.java', javaCode);
console.log(res);