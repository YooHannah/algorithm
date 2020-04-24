<template>
  <div>foo</div>
</template>
<script>
export default {
  mounted(){
    console.log(this.$route.query,typeof this.$route.query.name)
  } 
}
</script>

