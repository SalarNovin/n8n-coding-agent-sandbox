"""Utility math functions.

This module provides a safe implementation of factorial.
"""

__all__ = ["factorial"]


def factorial(n: int) -> int:
    """Return the factorial of a non-negative integer n.

    Args:
        n: A non-negative integer.

    Returns:
        The factorial of n as an int.

    Raises:
        TypeError: If n is not an int.
        ValueError: If n is negative.

    Examples:
        >>> factorial(5)
        120
        >>> factorial(0)
        1
    """
    if not isinstance(n, int):
        raise TypeError("factorial() only accepts integers")
    if n < 0:
        raise ValueError("factorial() not defined for negative values")

    result = 1
    for i in range(2, n + 1):
        result *= i
    return result
