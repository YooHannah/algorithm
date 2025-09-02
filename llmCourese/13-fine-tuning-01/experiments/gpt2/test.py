from logging import log
from transformers import AutoTokenizer, AutoModelForCausalLM
from transformers.utils import logging
logging.get_logger("transformers").setLevel(logging.ERROR)

# 加载训练后的 checkpoint
model = AutoModelForCausalLM.from_pretrained("output/checkpoint-1000")

# 模型设为推理模式
model.eval()

# 加载 tokenizer
tokenizer = AutoTokenizer.from_pretrained("gpt2")

while True:
  # 待分类文本
  text = input("Please input your reviews: ")
  # 构造 Prompt
  prompt = f"{text} Sentiment: "
  # 文本转 token ids - 记得以 eos 标识输入结束，与训练时一样
  inputs = tokenizer(prompt, return_tensors="pt")

  # 推理：预测标签
  output = model.generate(**inputs, do_sample=False, max_new_tokens=1)

  # label token 转标签文本
  label = tokenizer.decode(output[0][-1])

  print(f"Sentiment: {label}")
