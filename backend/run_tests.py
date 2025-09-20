#!/usr/bin/env python3
"""Test runner for the backend."""

import sys
import os
import pytest

sys.path.insert(0, os.path.dirname(__file__))

if __name__ == "__main__":
    exit_code = pytest.main([
        "-v",
        "--tb=short",
        "tests/",
    ] + sys.argv[1:])

    sys.exit(exit_code)