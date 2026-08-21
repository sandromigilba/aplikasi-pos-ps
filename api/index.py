import sys
import os

# Tambahkan folder _backend ke system path agar bisa di-import
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '_backend')))

from main import app
