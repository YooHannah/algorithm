import json
def rrf(ranks, k=1):
    ret = {}
    # 遍历每次的排序结果
    for rank in ranks:
        # 遍历排序中每个元素
        for id, val in rank.items():
            if id not in ret:
                ret[id] = {"score": 0, "text": val["text"]}
            # 计算 RRF 得分
            ret[id]["score"] += 1.0/(k+val["rank"])
    # 按 RRF 得分排序，并返回
    temp = sorted(ret.items(), key=lambda item: item[1]["score"], reverse=True)
    print('排序顺序')
    print(json.dumps(temp, indent=4, ensure_ascii=False))
    # return dict(sorted(ret.items(), key=lambda item: item[1]["score"], reverse=True))
    return temp
