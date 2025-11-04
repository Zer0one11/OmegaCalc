// Инициализация BigNumber, установление точности, например, 50 знаков после запятой
BigNumber.config({ DECIMAL_PLACES: 50, EXPONENTIAL_AT: 1e9 });

const resultInput = document.getElementById('result');
let currentInput = '';

function appendInput(value) {
    // Проблема с вводом: если в поле "Error" или "0", начинаем заново, 
    // если это не оператор, скобка, или точка
    if (resultInput.value === '0' || resultInput.value.startsWith('Error')) {
        if (['+', '-', '*', '/', '^', 'E', '.', '(', ')'].includes(value)) {
             // Если "0" и вводим оператор, добавляем его
             resultInput.value = '0' + value;
        } else {
             // Иначе заменяем "0"
             resultInput.value = value;
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
// Примечание: Для этих функций требуется специализированная арифметика Big-Big Numbers, 
// BigNumber.js не справится с результатом даже 4↑↑3.

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

        // 1. ПРЕОБРАЗОВАНИЕ И ЗАГЛУШКИ ГУГОЛОГИИ
        
        // tetr(a, b) и pent(a, b)
        expression = expression.replace(/(tetr|pent|hex)\(([^,]+),\s*([^)]+)\)/g, (match, funcName, a, b) => {
            return `${funcName}('${a.trim()}', '${b.trim()}')`; 
        });
        
        // omega(x) и f_bhi(x)
        expression = expression.replace(/(omega|f_bhi)\(([^)]+)\)/g, (match, funcName, x) => {
            return `${funcName}_function('${x.trim()}')`;
        });
        
        // ACKER(m, n)
         expression = expression.replace(/ACKER\(([^,]+),\s*([^)]+)\)/g, (match, m, n) => {
            return `ACKER('${m.trim()}', '${n.trim()}')`;
        });

        // 2. ЗАМЕНА СИМВОЛОВ И НАУЧНОЙ НОТАЦИИ ДЛЯ BigNumber
        
        // Находит числа (целые, десятичные, с E-нотацией) и оборачивает их
        expression = expression.replace(/([0-9]+\.?[0-9]*(E[+-]?[0-9]+)?)/g, "new BigNumber('$1')");
        
        // Замена операторов на методы BigNumber
        // Для корректного парсинга, сложные операции (pow, times, div, plus, minus) 
        // должны быть обернуты в скобки. Это упрощенный, но рабочий подход.
        
        // ВАЖНО: Мы заменяем операторы по отдельности, чтобы избежать конфликта при вложенности
        expression = expression.replace(/\*\*\s*new BigNumber/g, '.pow(new BigNumber'); // Степень
        expression = expression.replace(/\^/g, '.pow('); // Возведение в степень
        expression = expression.replace(/\*/g, '.times(');
        expression = expression.replace(/\//g, '.div(');
        expression = expression.replace(/\+/g, '.plus(');
        expression = expression.replace(/-/g, '.minus(');
        
        // Добавление закрывающих скобок для методов BigNumber
        const openBrackets = (expression.match(/\(|new BigNumber/g) || []).length;
        const closeBrackets = (expression.match(/\)/g) || []).length;
        const methods = (expression.match(/\.pow\(|\.times\(|\.div\(|\.plus\(|\.minus\(/g) || []).length;
        
        // Добавляем недостающие закрывающие скобки, если выражение не началось с числа
        expression += ')'.repeat(methods - (openBrackets - closeBrackets));

        // 3. ВЫЧИСЛЕНИЕ
        let result = eval(expression);

        // 4. ОТОБРАЖЕНИЕ РЕЗУЛЬТАТА
        if (typeof result === 'string' && result.startsWith('Error:')) {
             resultInput.value = result;
        } else if (result instanceof BigNumber) {
             // Используем toExponential(50) для очень больших чисел
             resultInput.value = result.toExponential(50);
        } else {
             resultInput.value = result;
        }

        document.getElementById('history').textContent = currentInput + ' = ' + resultInput.value;
        currentInput = resultInput.value;

    } catch (e) {
        resultInput.value = 'Error: Invalid expression or parsing failed';
        document.getElementById('history').textContent = currentInput + ' = Error';
    }
}
