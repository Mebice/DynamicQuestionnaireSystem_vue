<script>
import { RouterLink } from 'vue-router';
import { mapState, mapActions } from "pinia";
import headerState from '../stores/headerState';
export default{
    data(){
        return{

        }
    },
    computed:{
        ...mapState(headerState, ['headerColor', 'headerText']),
    },
    methods:{
        ...mapActions(headerState, ['updateHeaderColor', 'updateHeaderText']),

        goTo(x) {
            this.$router.push(x);
            // 根據不同的連結更新 headerColor
            switch (x) {
                case '/ForestageList':
                    this.updateHeaderColor('#3F6148'); // 設置為綠色
                    this.updateHeaderText('動態問卷系統(前台)'); // 设置显示文字
                    break;
                case '/BackstageList':
                    this.updateHeaderColor('#A4804C'); // 設置為棕色
                    this.updateHeaderText('動態問卷系統(後台)'); // 设置显示文字
                    break;
                default:
                    this.updateHeaderColor('#DCB770'); // 默認顏色
                    this.updateHeaderText('动态问卷系统'); // 默认显示文字
            }
        },
    },
    components: {
        RouterLink,
    },

}
</script>

<template>
    <div class="headershow"  id="transColor" :style="{ backgroundColor: headerColor }" style="transition: all 0.5s;">
        <RouterLink  to = "/ForestageList" @click="goTo('/ForestageList')"><i class="fa-solid fa-circle-user"></i></RouterLink>
        <RouterLink class="RouterItem" to = "/">{{ headerText }}</RouterLink>
        <!-- <RouterLink class="RouterItem" to = "/Test">Test</RouterLink> -->
        <!-- <button><RouterLink class="RouterItem" to = "/ForestageList">前台</RouterLink></button> -->
        <!-- <button><RouterLink class="RouterItem" to = "/ForestageAnswer">前台作答頁</RouterLink></button>
        <button><RouterLink class="RouterItem" to = "/ForestageConfirm">前台確認頁</RouterLink></button>
        <button><RouterLink class="RouterItem" to = "/ForestageStatistics">前台統計頁</RouterLink></button> -->
        <RouterLink  to = "/BackstageList" @click="goTo('/BackstageList')"><i class="fa-solid fa-gear"></i></RouterLink>
        <!-- <button><RouterLink class="RouterItem" to = "/BackstageList">後台</RouterLink></button> -->
        <!-- <button><RouterLink class="RouterItem" to = "/BackstageQuestionnaire">後台問題</RouterLink></button>
        <button><RouterLink class="RouterItem" to = "/BackstageQuestion">後台題目</RouterLink></button>
        <button><RouterLink class="RouterItem" to = "/BackstageConfirm">後台確認</RouterLink></button>
        <button><RouterLink class="RouterItem" to = "/EditQuestionnaire">問卷編輯</RouterLink></button> -->
    </div>
</template>

<style lang="scss" scoped>
.headershow{
    width: 100%;
    height: 100%;
    background-color: #206b56;
    display: flex;
    justify-content: space-around;
    align-items: center;
    flex-wrap: wrap;

    .fa-circle-user,.fa-gear{
        // background-color: #fff;
        // padding: 10px;
        // border-radius: 50%;
        font-size: 25pt;
        color: #fdfafa;

        &:hover{
            color: #DBD3A4;
        }

    }
}

//class放link比較好，可用比較多樣式
.RouterItem{
    text-decoration: none;
    font-size: 20pt;

    color: white;
    margin: 0px 10px;

    &:hover{
        color: #bb5572;
        
    }
}

</style>