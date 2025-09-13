# <!-- Prompt 调优与回归测试 -->
from langchain.prompts import PromptTemplate

need_answer = PromptTemplate.from_template("""
*********
你是一个数学天才，特别会解决用户问题，并给出计算结果 。
                                           
*********
用户问题:
{user_input}
*********
根据用户的问题给出一个数字即可，不要回复其他内容。""")

from langchain_core.output_parsers import BaseOutputParser
import re


class MyOutputParser(BaseOutputParser):
    """自定义parser，从思维链中取出最后的Y/N"""

    def parse(self, text: str) -> str:
        matches = re.findall(r'[YN]', text)
        return matches[-1] if matches else 'N'
    
chain_v2 = (
    need_answer
    | model
    | MyOutputParser()
)

run_evaluation(chain_v2, "my-dataset", "cot-"+datetime.now().strftime("%d/%m/%Y %H:%M:%S"))

# 保证全部数据同步到云端
langfuse.flush()