import sys
import os

# Tambahkan folder backend ke system path agar bisa di-import
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from main import app
