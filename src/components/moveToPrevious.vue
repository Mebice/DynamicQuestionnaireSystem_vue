<script>
export default {
    data() {
        return {

        }
    },
    methods: {
        // 返回
        moveToPreviousPage() {
            this.$router.go(-1);
        },
    }

}
</script>
<template>
    <i class="fa-solid fa-rotate-left" @click="moveToPreviousPage"></i>
</template>
<style lang="scss" scoped>
    .fa-rotate-left {
        color: rgba(161, 158, 158, 0.804);
        background-color: rgba(211, 211, 211, 0.804);
        font-size: 20pt;
        margin-bottom: 50px;
        position: fixed;
        left: 100px;
        bottom: 10px;
        transition: all 0.5s ease;
        border-radius: 50%;
        padding: 12px;

        &:hover {
            background-color: rgba(143, 143, 143, 0.804);
            cursor: pointer;
        }

        /* 使用伪元素添加文字 */
        &::after {
            content: '返回';
            color: white;
            font-size: 10pt;
            display: block;
            position: absolute;
            top: 50%;
            /* 相对于父元素垂直居中 */
            left: 50%;
            /* 相对于父元素水平居中 */
            transform: translate(-50%, -50%);
            /* 平移并旋转文字 */
            opacity: 0;
            /* 初始状态透明 */
            transition: opacity 0.3s ease;
            /* 添加过渡效果 */
            white-space: nowrap;
            /* 防止文字换行 */
        }

        &:hover::after {
            opacity: 1;
        }
    }
</style>