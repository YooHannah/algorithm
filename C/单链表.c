#include <stdio.h>
#include <malloc.h>
#include <stdlib.h>
#include <time.h>
#define OK 1
#define ERROR 0

typedef struct node{
    int data;
    struct node* next;
}node;
typedef struct node* linklist;

//	新建头指针
int listinit(linklist *L){
    *L = (linklist)malloc(sizeof(node));
    if(L == NULL){
        return -1;
    }
    (*L)->next = NULL;
//    (*L)->data = 199;
//    printf("头指针的值%d",(*L)->data);
    return 1;
}

//初始化单链表
int listcreat(linklist L,int n){
    linklist p;
	int i;
    for(i=0; i<n; i++){
        p = (linklist)malloc(sizeof(node));
        printf("请输入数据：");
        scanf("%d",p);
        p->next = L->next;
        L->next = p;
        //	printf("该结点数据：%d", p->data);
    }
	return 1;
}

//求单链表长度
int listlength(linklist L){
	linklist p;
	int j = 0;
	p=L->next;
	printf("该链表含有的数据有：");
	while(p){
		printf("%d,",p->data);
		p=p->next;
		++j;
	}
	printf("该链表长度为%d\n",j);
	return 1;
}

//获取单链表第N个位置元素	
int listgetelem(linklist L,int n){
	linklist p;
	int j=1;
	p=L->next;
	while(p&&j<n){
		p=p->next;
		++j;
	}
	if(!p||j>n){
		printf("链表中不存在该位置!");
		return -1;
	}
    printf("第%d位置的值为：%d\n",n,p->data);
	return 1;
}

//	在单链表第N个位置插入元素e
int listinsert(linklist L,int n,int e){
    linklist p,k;
	int j=1;
	p = L;

	while(p&&j<n){
		p=p->next;
		++j;
	}
	k=(linklist)malloc(sizeof(node));
	k->data = e;
	k->next=p->next;
	p->next=k;
	listlength(L);
    listgetelem(L,n);
	return 1;
}

//	头插法 
int listinserthead(linklist L,int e){
    linklist p,k;
	p = L;
	k=(linklist)malloc(sizeof(node));
	k->data = e;
	k->next=p->next;
	p->next=k;
	listlength(L);
    listgetelem(L,1);
	return 1;
}

//	尾插法 
int listinserttailor(linklist L,int e){
    linklist p,k;
	p = L;
	while(p->next){
		p = p->next;
	}
	k=(linklist)malloc(sizeof(node));
	k->data = e;
    p->next=k;
	k->next=NULL;
	listlength(L);
    listgetelem(L,7);
	return 1;
}

//	删除单链表第N个位置元素
int listdelete(linklist L,int n){
    linklist p;
	int j=1;
	p = L;
	while(p&&j<n){
		p=p->next;
		++j;
	}
	p->next=p->next->next;
	listlength(L);
    listgetelem(L,n);
	return 1;
}

int main(){
    linklist M;
    listinit(&M);
    listcreat(M,5);
	listlength(M);
	listgetelem(M,3);
	listinsert(M,2,9);
	listdelete(M,2);
	listinserthead(M,7);
	listinserttailor(M,6);
}