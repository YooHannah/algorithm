#include<stdio.h>
#define MAXSIZE 10
typedef struct
{
 int data;
 int cur;
}StaticLinkList[MAXSIZE];

//	静态链表初始化
void InitList(StaticLinkList L)//传递列表
{
 int i;
 for(i = 1; i < MAXSIZE-1; i++ )
 {	if(i==7){
	 L[i].cur = 0;
	}else{
	 L[i].cur = i+2;
	}
	 L[i].data = i;
	 ++i;
 }
 for(i = 0; i < MAXSIZE-1; i++ )
 {	
	if(i==MAXSIZE-2){
	 L[i].cur = 0;
	}else{
	 L[i].cur = i+2;
	}
	 ++i;
 }
 L[MAXSIZE-1].cur = 1;
// for(i = 0; i < MAXSIZE; i++ ){
//   printf("%d %d %d\n",i,L[i].data,L[i].cur);
// }
}

//求链表中数据元素个数；
int length(StaticLinkList L){
	int k,j;
	j=0;
	k=L[MAXSIZE-1].cur;
	while(k){
		k=L[k].cur;
		j++;
	}
	printf("表长:%d\n",j);
	return j;
}
//	在第n个元素前插入元素e
void insert(StaticLinkList L,int e,int n){
	int ll=length(L);
	int i,k,m;
	if(n<1||n>9){
		printf("插入的位置不存在!");
		return ;
	}
	if(ll==MAXSIZE-2){
		printf("链表已满!");
		return;
	}
	k = L[MAXSIZE-1].cur;
	for(i=0;i<n-1;i++){
		k=L[k].cur;
	}
	m = L[0].cur;
	L[0].cur = L[L[0].cur].cur;
    L[m].data = e;
	L[m].cur = k;
	L[L[MAXSIZE-1].cur].cur = m;	
	for(i = 0; i < MAXSIZE; i++ ){
    printf("%d %d %d\n",i,L[i].data,L[i].cur);
	}
	length(L);
}
//删除第n个位置元素(假删除，位置上还有数据)
void del(StaticLinkList L,int n){
	int i,k,m;
	if(n<1||n>9){
		printf("删除的位置不存在!");
		return ;
	}
	k = MAXSIZE-1;
	for(i=1;i<n;i++){
		k=L[k].cur;	
	}
	printf("%d\n",k);
	m=L[k].cur;
	L[k].cur =L[L[k].cur].cur;
	L[m].cur = L[0].cur;
	L[0].cur = m;
	
	for(i = 0; i < MAXSIZE; i++ ){
    printf("%d %d %d\n",i,L[i].data,L[i].cur);
	}
	length(L);
}
StaticLinkList randlist(int n){
	StaticLinkList L;
	for(i = 1;i<n-1;i++){
		L[i].data = rand() % 101;
		L[i].cur = i+1;
	}
	
}
void main()
{
 StaticLinkList list; 
 InitList(list);
 length(list);
 insert(list,77,2);
 del(list,1);
 randlist(20);
}