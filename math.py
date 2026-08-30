'''Utility math functions.'''

def factorial(n: int) -> int:
    '''Return n! (factorial of n).

    Args:
        n: non-negative integer

    Returns:
        factorial of n as int

    Raises:
        TypeError: if n is not an integer
        ValueError: if n is negative
    '''
    if not isinstance(n, int):
        raise TypeError('factorial() only accepts integers')
    if n < 0:
        raise ValueError('factorial() not defined for negative values')
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result


if __name__ == '__main__':
    import sys
    try:
        arg = int(sys.argv[1]) if len(sys.argv) > 1 else 5
        print(f'{arg}! = {factorial(arg)}')
    except Exception as e:
        print('Error:', e)
        sys.exit(1)
