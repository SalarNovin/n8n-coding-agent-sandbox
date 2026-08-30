"""math utility functions.

This module currently provides:
- factorial(n): compute n! for non-negative integers n.

The implementation validates inputs and uses an iterative approach.
"""

__all__ = ["factorial"]


def factorial(n):
    """Return the factorial of n (n!).

    Parameters
    ----------
    n : int
        A non-negative integer.

    Returns
    -------
    int
        The factorial of n.

    Raises
    ------
    TypeError
        If n is not an int.
    ValueError
        If n is negative.

    Examples
    --------
    >>> factorial(0)
    1
    >>> factorial(5)
    120
    """
    if not isinstance(n, int):
        raise TypeError("factorial() only accepts integer values")
    if n < 0:
        raise ValueError("factorial() not defined for negative values")

    result = 1
    for i in range(2, n + 1):
        result *= i
    return result
