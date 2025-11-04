// Инициализация BigNumber
BigNumber.config({ DECIMAL_PLACES: 50, EXPONENTIAL_AT: 1e9 });

const resultInput = document.getElementById('result');
let currentInput = '';

function appendInput(value) {
    if (resultInput.value === '0' || resultInput.value.startsWith('Error')) {
        // Если поле "0" или "Error", и вводим число, скобку, или E, то заменяем "0"
        if (!['+', '-', '*', '/', '^', '.'].includes(value)) {
             resultInput.value = value;
        } else {
             // Иначе (если оператор), добавляем к "0"
             resultInput.value += value;
        }
    } else {
        resultInput.value += value;
    }
    currentInput = resultInput.value;
}

function clearDisplay() {
    resultInput.value = '0';
    currentInput = '';
    document.getElementById('history').textContent = '';
}

// =================================================================
// СТРУКТУРЫ ДЛЯ ГУГОЛОГИЧЕСКИХ ФУНКЦИЙ (ЗАГЛУШКИ)
// =================================================================

// Функции-заглушки (stubs)
function tetr(baseStr, heightStr) { return `Error: tetr(a,b) is too complex. Max: a^a.`; }
function pent(baseStr, heightStr) { return `Error: Pentation $\uparrow\uparrow\uparrow$ is not yet implemented.`; }
function hex(baseStr, heightStr) { return `Error: Hexation $\uparrow^4$ is not yet implemented.`; }
function omega_function(xStr) { return `Error: $\omega(x)$ requires a numerical solver.`; }
function ACKER(mStr, nStr) { return `Error: ACKER(m,n) explodes rapidly. Max safe: A(3, 4).`; }
function f_bhi(indexStr, nStr) { return `Error: f_bhi is part of the Fast Growing Hierarchy.`; }

// =================================================================
// ОСНОВНОЙ ФУНКЦИОНАЛ КАЛЬКУЛЯТОРА
// =================================================================

function calculate() {
    if (!currentInput) return;

    try {
        let expression = currentInput;

        // 1. ПРЕОБРАЗОВАНИЕ ВЫЗОВОВ ФУНКЦИЙ ГУГОЛОГИИ
        
        // Функции с двумя аргументами: tetr(a, b), pent(a, b), hex(a, b), ACKER(m, n)
        expression = expression.replace(/(tetr|pent|hex|ACKER)\(([^,]+),\s*([^)]+)\)/g, (match, funcName, a, b) => {
            return `${funcName}('${a.trim()}', '${b.trim()}')`; 
        });
        
        // Функции с одним аргументом: omega(x), f_bhi(x)
        expression = expression.replace(/(omega)\(([^)]+)\)/g, (match, funcName, x) => {
            return `${funcName}_function('${x.trim()}')`;
        });
        
        // 2. ЗАМЕНА СИМВОЛОВ НАУЧНОЙ НОТАЦИИ И ОПЕРАТОРОВ НА МЕТОДЫ BigNumber

        // Шаг A: Оборачиваем числа (включая E-нотацию) в конструктор BigNumber
        // Это делается первым, чтобы не затрагивать числа в строковых аргументах функций-заглушек
        expression = expression.replace(/([0-9]+\.?[0-9]*(E[+-]?[0-9]+)?)/g, "new BigNumber('$1')");
        
        // Шаг B: Заменяем операторы на цепочки методов BigNumber,
        // используя '$$' как временный символ для замены закрывающей скобки.
        // Мы делаем это в порядке приоритета: ^, *, /, +, -
        
        // Степень: a^b -> a.pow(b)
        // ВНИМАНИЕ: Для корректной работы с BigNumber в eval, нам нужна особая обработка.
        // Проще всего использовать временный токен, который гарантирует правильное закрытие.
        expression = expression.replace(/\^/g, '.pow$$(');
        
        // Умножение: a * b -> a.times(b)
        expression = expression.replace(/\*/g, '.times$$(');
        
        // Деление: a / b -> a.div(b)
        expression = expression.replace(/\//g, '.div$$(');
        
        // Сложение: a + b -> a.plus(b)
        expression = expression.replace(/\+/g, '.plus$$(');
        
        // Вычитание: a - b -> a.minus(b)
        // Унарный минус (например, в самом начале или после открывающей скобки) 
        // не заменяется на .minus
        expression = expression.replace(/([^.()\s]|^)\s*-\s*new BigNumber/g, '$1.minus$$(');

        // Шаг C: Правильно закрываем скобки.
        // Заменяем все временные токены '$$(' на '('
        expression = expression.replace(/\$\$/g, '');

        // 3. ДОПОЛНИТЕЛЬНОЕ ЗАКРЫТИЕ СКОБОК
        // Убеждаемся, что все методы BigNumber (pow, times, div и т.д.) имеют закрывающую скобку.
        const openMethods = (expression.match(/\.(pow|times|div|plus|minus)\(/g) || []).length;
        const totalOpenBrackets = (expression.match(/\(/g) || []).length;
        const totalCloseBrackets = (expression.match(/\)/g) || []).length;

        // Если открытых скобок больше, чем закрытых (из-за нашей замены), добавляем их в конце.
        expression += ')'.repeat(totalOpenBrackets - totalCloseBrackets);

        // 4. ВЫЧИСЛЕНИЕ (используем eval)
        let result = eval(expression);

        // 5. ОТОБРАЖЕНИЕ РЕЗУЛЬТАТА
        if (typeof result === 'string' && result.startsWith('Error:')) {
             resultInput.value = result;
        } else if (result instanceof BigNumber) {
             // Используем toExponential(50) для очень больших чисел (например, 35E238)
             resultInput.value = result.toExponential(50);
        } else {
             resultInput.value = result;
        }

        document.getElementById('history').textContent = currentInput + ' = ' + resultInput.value;
        currentInput = resultInput.value;

    } catch (e) {
        // console.error(e); // Для отладки
        resultInput.value = 'Error: Parsing failed. Check syntax.';
        document.getElementById('history').textContent = currentInput + ' = Error';
    }
}
