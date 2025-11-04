// Инициализация BigNumber, установление точности, например, 50 знаков после запятой
BigNumber.config({ DECIMAL_PLACES: 50, EXPONENTIAL_AT: 1e9 });

const resultInput = document.getElementById('result');
let currentInput = '';

function appendInput(value) {
    if (resultInput.value === '0' && value !== '.' && value !== 'E' && value !== '(') {
        resultInput.value = value;
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

/**
 * ЗАГЛУШКА для Тетрации (Knuth's up-arrow notation, a↑↑b)
 * ВНИМАНИЕ: Для реальной работы с большими числами нужен Logarithm-Based Representation (LBR)
 * или другая специализированная библиотека. Прямое вычисление a^(a^(...)) быстро выйдет
 * за пределы даже BigNumber.js.
 * @param {string} baseStr - Основание (BigNumber string)
 * @param {string} heightStr - Высота (BigNumber string)
 */
function tetr(baseStr, heightStr) {
    // В реальной реализации здесь будет сложная логика
    const base = new BigNumber(baseStr);
    const height = new BigNumber(heightStr);

    if (height.isZero()) return new BigNumber(1);
    if (height.isEqualTo(1)) return base;
    
    // ВАЖНО: Это неверное вычисление, а лишь Placeholder для демо.
    // Тетрация (2↑↑4 = 2^2^2^2 = 65536). Здесь мы возвращаем простой множитель.
    if (height.isGreaterThan(2)) {
        return `Error: tetr(a,b) is too complex for this version. Try tetr(a, 2) which is a^a.`;
    }

    return base.pow(base).toString();
}

/**
 * ЗАГЛУШКА для Омега-функции Райта (Wright's Omega function)
 * Решение w + ln(w) = x. Требует численных методов (например, итерации Ньютона).
 * @param {string} xStr - Аргумент (BigNumber string)
 */
function omega_function(xStr) {
    // Для реальной реализации нужны итерационные методы
    return `Error: $\omega(x)$ requires a numerical solver (Newton's method).`;
}

/**
 * ЗАГЛУШКА для Пентации (a↑↑↑b)
 */
function pent(baseStr, heightStr) {
    return `Error: Pentation $\uparrow\uparrow\uparrow$ is not yet implemented.`;
}


// =================================================================
// ОСНОВНОЙ ФУНКЦИОНАЛ КАЛЬКУЛЯТОРА
// =================================================================

function calculate() {
    if (!currentInput) return;

    try {
        let expression = currentInput;

        // 1. ПРЕОБРАЗОВАНИЕ И ЗАГЛУШКИ ГУГОЛОГИИ
        
        // Заменяем наши вызовы функций на заглушки для eval
        // ВАЖНО: eval() используется для простоты, но в реальном проекте
        // его нужно заменить на собственный парсер AST для безопасности и
        // корректной работы с объектами BigNumber.
        
        // tetr(a, b)
        expression = expression.replace(/tetr\(([^,]+),\s*([^)]+)\)/g, (match, a, b) => {
            return `tetr('${a.trim()}', '${b.trim()}')`; // Передаем строки в заглушку
        });
        
        // omega(x)
        expression = expression.replace(/omega\(([^)]+)\)/g, (match, x) => {
            return `omega_function('${x.trim()}')`;
        });
        
        // pent(a, b)
        expression = expression.replace(/pent\(([^,]+),\s*([^)]+)\)/g, (match, a, b) => {
             return `pent('${a.trim()}', '${b.trim()}')`;
        });

        // 2. ЗАМЕНА СИМВОЛОВ И НАУЧНОЙ НОТАЦИИ ДЛЯ BigNumber
        
        // Используем встроенный парсер BigNumber для чисел (35e238 -> new BigNumber('35e238'))
        // Регулярное выражение находит числа (целые, десятичные, с E-нотацией)
        // и оборачивает их в вызов new BigNumber(...)
        expression = expression.replace(/([0-9]+\.?[0-9]*(E[+-]?[0-9]+)?)/g, "new BigNumber('$1')");
        
        // Замена операторов на методы BigNumber
        expression = expression.replace(/\*/g, ".times(") + ')'.repeat((expression.match(/\*/g) || []).length);
        expression = expression.replace(/\//g, ".div(") + ')'.repeat((expression.match(/\//g) || []).length);
        expression = expression.replace(/\+/g, ".plus(") + ')'.repeat((expression.match(/\+/g) || []).length);
        expression = expression.replace(/-/g, ".minus(") + ')'.repeat((expression.match(/-/g) || []).length);
        
        // Замена операции возведения в степень (BigNumber не поддерживает ** или ^)
        // Это требует более сложного AST, но для простоты - используем метод .pow()
        // ВНИМАНИЕ: Это не поддерживает цепочку степеней (a^b^c)
        expression = expression.replace(/\^/g, ".pow(") + ')'.repeat((expression.match(/\^/g) || []).length);
        
        
        // 3. ВЫЧИСЛЕНИЕ
        // Добавление BigNumber(0) для корректного начала вычисления, если строка начинается не с числа
        if (!expression.startsWith('new BigNumber(')) {
             expression = 'new BigNumber(0)' + expression;
        }

        // Eval() - это самый простой способ, но небезопасный.
        let result = eval(expression);

        // 4. ОТОБРАЖЕНИЕ РЕЗУЛЬТАТА
        if (typeof result === 'string' && result.startsWith('Error:')) {
             resultInput.value = result;
        } else {
             // toExponential(100) позволяет отображать очень много знаков
             resultInput.value = result.toExponential(50);
        }

        document.getElementById('history').textContent = currentInput + ' = ' + resultInput.value;
        currentInput = resultInput.value;

    } catch (e) {
        resultInput.value = 'Error: Invalid expression';
        document.getElementById('history').textContent = currentInput + ' = Error';
    }
}
