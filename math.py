"""math.py

ماژول ساده‌ای که تابع‌های ریاضی کمکی را قرار می‌دهد.
"""

def factorial(n: int) -> int:
    """Return the factorial of a non-negative integer n.

    Args:
        n: non-negative integer

    Returns:
        The factorial of n (n!).

    Raises:
        TypeError: If n is not an integer.
        ValueError: If n is negative.
    """
    if not isinstance(n, int):
        raise TypeError("factorial() only accepts integers")
    if n < 0:
        raise ValueError("factorial() not defined for negative values")
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result
