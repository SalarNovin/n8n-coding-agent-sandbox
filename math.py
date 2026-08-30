"""Utility math functions.

این ماژول شامل تابع factorial برای محاسبه فاکتوریل اعداد صحیح غیرمنفی است.
"""
from typing import Any

__all__ = ["factorial"]


def factorial(n: int) -> int:
    """Return the factorial of a non-negative integer n.

    Args:
        n: A non-negative integer whose factorial to compute.

    Returns:
        The factorial of n (n!).

    Raises:
        TypeError: If n is not an int.
        ValueError: If n is negative.

    Examples:
        >>> factorial(0)
        1
        >>> factorial(5)
        120
    """
    # Validate type
    if not isinstance(n, int):
        raise TypeError("n must be an integer")

    # Validate value
    if n < 0:
        raise ValueError("n must be non-negative")

    result = 1
    for i in range(2, n + 1):
        result *= i
    return result


# Optional quick self-test when run as a script
if __name__ == "__main__":
    import sys

    def _print_usage():
        print("Usage: python math.py <non-negative-integer>")

    if len(sys.argv) != 2:
        _print_usage()
    else:
        try:
            value = int(sys.argv[1])
            print(f"{value}! = {factorial(value)}")
        except Exception as e:
            print("Error:", e)
