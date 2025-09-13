#!/usr/bin/env python3
import sys
import os

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('Usage: file_rename.py <old_name> <new_name>')
        sys.exit(1)
        
    # 获取旧文件名
    
