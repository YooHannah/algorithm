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

//	�½�ͷָ��
int listinit(linklist *L){
    *L = (linklist)malloc(sizeof(node));
    if(L == NULL){
        return -1;
    }
    (*L)->next = NULL;
//    (*L)->data = 199;
//    printf("ͷָ���ֵ%d",(*L)->data);
    return 1;
}

//��ʼ��������
int listcreat(linklist L,int n){
    linklist p;
	int i;
    for(i=0; i<n; i++){
        p = (linklist)malloc(sizeof(node));
        printf("���������ݣ�");
        scanf("%d",p);
        p->next = L->next;
        L->next = p;
        //	printf("�ý�����ݣ�%d", p->data);
    }
	return 1;
}

//��������
int listlength(linklist L){
	linklist p;
	int j = 0;
	p=L->next;
	printf("�������е������У�");
	while(p){
		printf("%d,",p->data);
		p=p->next;
		++j;
	}
	printf("��������Ϊ%d\n",j);
	return 1;
}

//��ȡ�������N��λ��Ԫ��	
int listgetelem(linklist L,int n){
	linklist p;
	int j=1;
	p=L->next;
	while(p&&j<n){
		p=p->next;
		++j;
	}
	if(!p||j>n){
		printf("�����в����ڸ�λ��!");
		return -1;
	}
    printf("��%dλ�õ�ֵΪ��%d\n",n,p->data);
	return 1;
}

//	�ڵ������N��λ�ò���Ԫ��e
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

//	ͷ�巨 
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

//	β�巨 
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

//	ɾ���������N��λ��Ԫ��
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