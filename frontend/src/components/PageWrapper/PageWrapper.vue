<template>
    <v-main class="page-wrapper">
        <slot></slot>
    </v-main>
</template>

<script>
</script>

<style>
.page-wrapper {
    background-color: var(--bg-page);
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24px;
}
</style>