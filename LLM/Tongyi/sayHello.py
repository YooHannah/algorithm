#!/usr/bin/env python

import sys
import os

# 练习tabby 提示 seetting http://47.109.52.135:17864

# rename filename

def rename(filename):
  if filename.endswith('.jpg'):
    new_filename = filename.replace('.jpg', '.png')
    os.rename(filename, new_filename)
    

