// Инициализация BigNumber
BigNumber.config({ DECIMAL_PLACES: 50, EXPONENTIAL_AT: 1e9 });

const resultInput = document.getElementById('result');
let currentInput = '';

// *** ИСПРАВЛЕННАЯ ФУНКЦИЯ ДЛЯ ВВОДА ЧИСЕЛ ***
function appendInput(value) {
    const currentValue = resultInput.value;

    // Сброс, если текущее значение - "0" или "Error"
    if (currentValue === '0' || currentValue.startsWith('Error')) {
        // Если вводим оператор, точку или скобку, то добавляем его к "0" или сбрасываем ошибку
        if (['+', '-', '*', '/', '^', '.', 'E', '(', ')'].includes(value)) {
             // Если это оператор, добавляем его к "0"
             resultInput.value = (value === '.') ? '0.' : value;
        } else {
             // Если это число или начало функции, заменяем "0" или "Error"
             resultInput.value = value;
        }
    } else {
        // В противном случае просто добавляем значение
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
        
        // Функции с двумя аргументами
        expression = expression.replace(/(tetr|pent|hex|ACKER)\(([^,]+),\s*([^)]+)\)/g, (match, funcName, a, b) => {
            return `${funcName}('${a.trim()}', '${b.trim()}')`; 
        });
        
        // Функции с одним аргументом
        expression = expression.replace(/(omega|f_bhi)\(([^)]+)\)/g, (match, funcName, x) => {
            return `${funcName}_function('${x.trim()}')`;
        });
        
        // 2. ЗАМЕНА СИМВОЛОВ НАУЧНОЙ НОТАЦИИ И ОПЕРАТОРОВ НА МЕТОДЫ BigNumber

        // Шаг A: Оборачиваем числа (включая E-нотацию) в конструктор BigNumber
        expression = expression.replace(/([0-9]+\.?[0-9]*(E[+-]?[0-9]+)?)/g, "new BigNumber('$1')");
        
        // Шаг B: Заменяем операторы на цепочки методов BigNumber
        expression = expression.replace(/\^/g, '.pow$$(');
        expression = expression.replace(/\*/g, '.times$$(');
        expression = expression.replace(/\//g, '.div$$(');
        expression = expression.replace(/\+/g, '.plus$$(');
        
        // Вычитание: a - b -> a.minus(b) (избегаем унарного минуса, заменяя только бинарный)
        expression = expression.replace(/([^.()\s]|^)\s*-\s*new BigNumber/g, '$1.minus$$(');

        // Шаг C: Правильно закрываем скобки, убирая временный токен
        expression = expression.replace(/\$\$/g, '');

        // 3. ДОПОЛНИТЕЛЬНОЕ ЗАКРЫТИЕ СКОБОК
        const totalOpenBrackets = (expression.match(/\(/g) || []).length;
        const totalCloseBrackets = (expression.match(/\)/g) || []).length;
        
        // Добавляем недостающие закрывающие скобки, если открытых больше, чем закрытых
        expression += ')'.repeat(totalOpenBrackets - totalCloseBrackets);

        // 4. ВЫЧИСЛЕНИЕ (используем eval)
        let result = eval(expression);

        // 5. ОТОБРАЖЕНИЕ РЕЗУЛЬТАТА
        if (typeof result === 'string' && result.startsWith('Error:')) {
             resultInput.value = result;
        } else if (result instanceof BigNumber) {
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
